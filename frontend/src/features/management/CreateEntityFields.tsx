export function CreateEntityFields({
  kind,
}: {
  kind: "create-category" | "create-role";
}) {
  return (
    <>
      <label>
        Name
        <input
          name="name"
          required
          minLength={2}
          maxLength={60}
          autoFocus
          placeholder={
            kind === "create-category"
              ? "e.g. Product & design"
              : "e.g. Team lead"
          }
        />
      </label>
      {kind === "create-category" ? (
        <label>
          Description
          <textarea
            name="description"
            maxLength={240}
            placeholder="What brings this group together?"
          />
        </label>
      ) : (
        <label className="checkbox">
          <input type="checkbox" name="canManageCategories" />
          Can create and delete categories
        </label>
      )}
    </>
  );
}
