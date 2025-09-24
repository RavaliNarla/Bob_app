// src/store/resumestore.js
import { createSlice, createAsyncThunk, nanoid } from "@reduxjs/toolkit";
import apiService from "../services/apiService";

/** ===== client limits ===== */
const MAX_CONCURRENCY = 5;     // uploads in flight
const STARTS_PER_SEC  = 3;     // how many we START per second
const MAX_RETRIES     = 0;     // no retries for now

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Create a batch BEFORE any upload: store picked files in Redux */
export const createBatch = ({ name, files }) => {
  const batchId = `${Date.now()}_${nanoid(6)}`;
  const items = Array.from(files || []).map((f) => ({
    id: `${batchId}_${nanoid(6)}`,
    filename: f.name,
    size: f.size,
    pickedAt: Date.now(),
    file: f,               // kept only in memory (not persisted)
    status: "queued",      // queued | uploading | uploaded | failed
    progress: 0,
    uploadedAt: null,
    error: null,
  }));
  return resumeSlice.actions._createBatch({ batchId, name, items });
};

/** Fetch ALL resumes once (used on page open, and after successful uploads) */
export const fetchAllResumes = createAsyncThunk(
  "resume/fetchAllResumes",
  async (_, { rejectWithValue }) => {
    try {
      // interceptor returns: { success, message, data: [...] }
      const body = await apiService.getAllResumesJC();
      return Array.isArray(body?.data) ? body.data : [];
    } catch (e) {
      return rejectWithValue(e?.response?.data || e.message);
    }
  }
);

/** Start the long-running PROCESS job (dummy endpoint for now) */
export const processAllResumes = createAsyncThunk(
  "resume/processAllResumes",
  async (_, { rejectWithValue }) => {
    try {
      const body = await apiService.processResumesJC();
      return { message: body?.message || "Process started" };
    } catch (e) {
      return rejectWithValue(e?.response?.data || e.message);
    }
  }
);

/** Upload a whole batch (throttled + concurrent) */
export const uploadBatch = createAsyncThunk(
  "resume/uploadBatch",
  async ({ batchId }, { getState, dispatch }) => {
    const st = getState().resume;
    const b = st.batches[batchId];
    if (!b) throw new Error("Batch not found");

    // Only queued items (with a File)
    const queue = b.items.filter((it) => it.status === "queued" && it.file);

    // Shared state for workers
    let index = 0;
    const starts = []; // for STARTS_PER_SEC
    let uploadedCount = 0;

    const takeNext = () => {
      if (index >= queue.length) return null;
      const it = queue[index];
      index += 1;
      return it;
    };

    const rateLimitStart = async () => {
      const now = Date.now();
      // keep only the last 1s window
      for (let i = starts.length - 1; i >= 0; i--) {
        if (now - starts[i] > 1000) starts.splice(i, 1);
      }
      if (starts.length >= STARTS_PER_SEC) {
        const wait = 1000 - (now - starts[0]);
        if (wait > 0) await sleep(wait);
      }
      starts.push(Date.now());
      // small jitter to avoid herd spikes
      await sleep(30 + Math.floor(Math.random() * 90));
    };

    async function worker() {
      while (true) {
        const it = takeNext();
        if (!it) break; // nothing left

        await rateLimitStart();
        dispatch(markUploading({ batchId, itemId: it.id }));

        try {
          await apiService.uploadResumeJC(it.file, (e) => {
            const pct = e.total ? Math.round((e.loaded / e.total) * 100) : null;
            if (pct != null) {
              dispatch(setProgress({ batchId, itemId: it.id, progress: pct }));
            }
          });

          uploadedCount += 1;
          dispatch(markUploaded({ batchId, itemId: it.id }));
        } catch (err) {
          const msg = err?.response?.data?.error || err.message || "Upload failed";
          dispatch(markFailed({ batchId, itemId: it.id, error: msg }));
          if (MAX_RETRIES > 0) {
            // TODO: add per-item retry logic if needed
          }
        }
      }
    }

    const workerCount = Math.min(MAX_CONCURRENCY, queue.length);
    await Promise.all(Array.from({ length: workerCount }, () => worker()));

    // If at least one file uploaded, refresh the "All Resumes" list ONCE.
    if (uploadedCount > 0) {
      await dispatch(fetchAllResumes());
    }

    return { batchId, uploadedCount };
  }
);

export const deleteResume = createAsyncThunk(
  "resume/deleteResume",
  async (resumeId, { rejectWithValue }) => {
    try {
      // Expect apiService.deleteResumeJC to exist later.
      if (typeof apiService.deleteResumeJC !== "function") {
        throw new Error("Delete API not ready (apiService.deleteResumeJC missing)");
      }
      const body = await apiService.deleteResumeJC(resumeId);
      // You can validate body.success here if your API returns it
      return { resumeId };
    } catch (e) {
      return rejectWithValue(e?.response?.data || e.message || "Delete failed");
    }
  }
);

const resumeSlice = createSlice({
  name: "resume",
  initialState: {
    // batches keyed by id
    batches: {},
    activeBatchId: null,

    // GLOBAL: all resumes from server (fetched on page open, and after successful uploads)
    allResumes: [],
    allLastLoadedAt: null,

    // PROCESS state
    processing: false,
    processMessage: "",
    lastProcessStartedAt: null,
    processError: "",
  },
  reducers: {
    _createBatch(state, { payload }) {
      const { batchId, name, items } = payload;
      state.batches[batchId] = {
        id: batchId,
        name,
        createdAt: Date.now(),
        status: "idle", // idle | uploading | uploaded
        items,
      };
      state.activeBatchId = batchId;
    },
    setActiveBatch(state, { payload }) {
      if (state.batches[payload]) state.activeBatchId = payload;
    },
    clearBatch(state, { payload }) {
      if (payload && state.batches[payload]) {
        delete state.batches[payload];
        if (state.activeBatchId === payload) state.activeBatchId = null;
      } else {
        state.batches = {};
        state.activeBatchId = null;
      }
    },

    // per-file mutations
    markUploading(state, { payload }) {
      const { batchId, itemId } = payload;
      const it = state.batches[batchId]?.items.find((x) => x.id === itemId);
      if (it) it.status = "uploading";
      const b = state.batches[batchId];
      if (b) b.status = "uploading";
    },
    setProgress(state, { payload }) {
      const { batchId, itemId, progress } = payload;
      const it = state.batches[batchId]?.items.find((x) => x.id === itemId);
      if (it) it.progress = progress;
    },
    markUploaded(state, { payload }) {
      const { batchId, itemId } = payload;
      const it = state.batches[batchId]?.items.find((x) => x.id === itemId);
      if (it) {
        it.status = "uploaded";
        it.progress = 100;
        it.uploadedAt = Date.now();
        it.file = null; // free memory
      }
      const b = state.batches[batchId];
      if (b && b.items.every((x) => x.status === "uploaded" || x.status === "failed")) {
        b.status = "uploaded";
      }
    },
    markFailed(state, { payload }) {
      const { batchId, itemId, error } = payload;
      const it = state.batches[batchId]?.items.find((x) => x.id === itemId);
      if (it) {
        it.status = "failed";
        it.error = error || "Upload failed";
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadBatch.fulfilled, (state, { payload }) => {
        const b = state.batches[payload.batchId];
        if (b && b.items.every((x) => x.status === "uploaded" || x.status === "failed")) {
          b.status = "uploaded";
        }
      })
      .addCase(fetchAllResumes.fulfilled, (state, { payload }) => {
        state.allResumes = payload || [];
        state.allLastLoadedAt = Date.now();
      })
      // PROCESS
      .addCase(processAllResumes.pending, (state) => {
        state.processing = true;
        state.processError = "";
      })
      .addCase(processAllResumes.fulfilled, (state, { payload }) => {
        state.processing = false;
        state.processMessage = payload?.message || "Process started";
        state.lastProcessStartedAt = Date.now();
      })
      .addCase(deleteResume.fulfilled, (state, { payload }) => {
  // Optimistically remove from the big table
  state.allResumes = (state.allResumes || []).filter(
    (r) => r.resume_id !== payload.resumeId
  );
})
      .addCase(processAllResumes.rejected, (state, { payload }) => {
        state.processing = false;
        state.processError = typeof payload === "string" ? payload : "Failed to start process";
      });
  },
});

export const {
  setActiveBatch,
  clearBatch,
  markUploading,
  setProgress,
  markUploaded,
  markFailed,
} = resumeSlice.actions;

export default resumeSlice.reducer;
