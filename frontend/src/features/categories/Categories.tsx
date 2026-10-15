import { Shapes, Trash2 } from "lucide-react";
import type { Category } from "../../models";
export function Categories({
  categories,
  managers,
  onDelete,
}: {
  categories: Category[];
  managers: boolean;
  onDelete: (category: Category) => void;
}) {
  return (
    <div className="cards">
      {categories.map((category) => (
        <section className="panel category-card" key={category.id}>
          <span className="category-icon">
            <Shapes />
          </span>
          <h2>{category.name}</h2>
          <p>{category.description || "A space to connect your people."}</p>
          <div>
            <span>{category._count?.users || 0} people</span>
            {managers && (
              <button
                title={`Delete ${category.name}`}
                onClick={() => onDelete(category)}
              >
                <Trash2 size={17} />
              </button>
            )}
          </div>
        </section>
      ))}
      {!categories.length && (
        <div className="panel empty">
          No categories yet.{" "}
          {managers
            ? "Create your first category to start connecting people."
            : "Your managers can create categories for this workspace."}
        </div>
      )}
    </div>
  );
}
