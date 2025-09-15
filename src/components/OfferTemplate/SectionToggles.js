import { Form } from 'react-bootstrap';
import { useTemplateStore } from '../../store/useTemplateStore';
import '../../css/Editor.css';

export default function SectionToggles() {
  const sections = useTemplateStore(s => s.template.sections);
  const setSection = useTemplateStore(s => s.setSection);

  return (
    <>
      <div className="section_toggle">
        <h6>Content Sections</h6>
        {Object.keys(sections).map(key => (
          <Form.Check
            key={key}
            type="checkbox"
            className="mb-2 check"
            label={key[0].toUpperCase() + key.slice(1)}
            checked={!!sections[key]}
            onChange={(e) => setSection(key, e.target.checked)}
          />
        ))}
      </div>

    </>
  );
}