import type { User, Role, Category } from "../../models";
export function UserMembershipFields({
  user,
  roles,
  categories,
}: {
  user: User;
  roles: Role[];
  categories: Category[];
}) {
  return (
    <>
      <label>
        Role
        <select name="roleId" defaultValue={user.role.id}>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend>Categories</legend>
        {categories.map((category) => (
          <label className="checkbox" key={category.id}>
            <input
              type="checkbox"
              name="categoryIds"
              value={category.id}
              defaultChecked={user.categories.some((c) => c.id === category.id)}
            />
            {category.name}
          </label>
        ))}
        {!categories.length && <p>Create a category first.</p>}
      </fieldset>
    </>
  );
}
