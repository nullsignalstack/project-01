import { useMemo } from "react";
import type { User } from "../../models";
import { filterPeople } from "./filterPeople";

export function useFilteredPeople(
  people: User[],
  search: string,
  roleId: string,
) {
  return useMemo(
    () => filterPeople(people, search, roleId),
    [people, search, roleId],
  );
}
