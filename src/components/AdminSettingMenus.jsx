let AdminSettingMenus = {
  name: "Settings",
  accessLevel: "A",
  entities: [
    {
      name: "Users",
      singularName: "User",
      dbCollection: "users",
      addFacility: true,
      deleteFacility: true,
      editFacility: true,
      accessLevel: "A",
    },
    {
      name: "Roles",
      singularName: "Role",
      dbCollection: "roles",
      addFacility: true,
      deleteFacility: true,
      editFacility: true,
      accessLevel: "A",
    },
    {
      name: "MilkRates",
      singularName: "MilkRate",
      dbCollection: "roles",
      addFacility: true,
      deleteFacility: true,
      editFacility: false,
      accessLevel: "A",
    },
  ],
};
export default AdminSettingMenus;
