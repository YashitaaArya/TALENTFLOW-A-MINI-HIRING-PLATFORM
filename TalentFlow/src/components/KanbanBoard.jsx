export default function KanbanBoard({ columns }) {
  return (
    <div className="flex gap-4 overflow-x-auto">
      {columns.map((col) => (
        <div key={col.id} className="bg-gray-100 p-3 rounded-lg min-w-[200px]">
          <h4 className="font-semibold mb-2">{col.title}</h4>
          <div className="space-y-2">
            {col.items.map((item) => (
              <div
                key={item.id}
                className="p-2 bg-white rounded shadow-sm"
              >
                {item.name}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
