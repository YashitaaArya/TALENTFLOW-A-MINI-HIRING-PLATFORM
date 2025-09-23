export default function QuestionBuilder({ question, onChange }) {
  return (
    <div className="p-3 border rounded mb-2">
      <input
        type="text"
        placeholder="Question text"
        value={question.text || ""}
        onChange={(e) => onChange({ ...question, text: e.target.value })}
        className="w-full px-2 py-1 border rounded"
      />
    </div>
  );
}
