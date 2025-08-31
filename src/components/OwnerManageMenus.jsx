let OwnerManageMenus = {
    name: "Manage",
    accessLevel: "D",
    entities: [
      {
        name: "Clients",          
        singularName: "Client",
        addFacility: true,
        deleteFacility: true,
        editFacility: true,
        isReady: true,
        dbCollection: "users",    
        accessLevel: "A",
      },
    ],
  };
  
  export default OwnerManageMenus;
  