import type { User } from "../../models";

export function filterPeople(people: User[], search: string, roleId: string) {
  const query = search.toLowerCase();
  return people.filter(
    (user) =>
      `${user.name} ${user.email} ${user.categories.map((category) => category.name).join(" ")}`
        .toLowerCase()
        .includes(query) &&
      (!roleId || user.role.id === roleId),
  );
}
