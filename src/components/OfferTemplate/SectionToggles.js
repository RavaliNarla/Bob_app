import { Form } from 'react-bootstrap';
import { useTemplateStore } from '../../store/useTemplateStore';

export default function SectionToggles() {
  const sections = useTemplateStore(s => s.template.sections);
  const setSection = useTemplateStore(s => s.setSection);

  return (
    <>
      <h6>Content Sections</h6>
      {Object.keys(sections).map(key => (
        <Form.Check
          key={key}
          type="checkbox"
          className="mb-2"
          label={key[0].toUpperCase() + key.slice(1)}
          checked={!!sections[key]}
          onChange={(e) => setSection(key, e.target.checked)}
        />
      ))}
    </>
  );
}