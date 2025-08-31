let AdminReportMenus = {
  accessLevel: "D",
  name: "Reports",
  entities: [
    {
      name: "Activity Report",
      singularName: "Activity",
      dbCollection: "activities",
      addFacility: false,
      deleteFacility: true,
      editFacility: true,
      accessLevel: "A",
    },
  ],
};
export default AdminReportMenus;
