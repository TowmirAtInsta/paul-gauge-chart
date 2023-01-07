import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import ChartCard from "./components/ChartCard";


const ZOHO = window.ZOHO;

function App() {
  const [initialized, setInitialized] = useState(false) // initialize the widget
  const [entity, setEntity] = useState() // get the current entity
  const [entityId, setEntityId] = useState() // get the current entity ID
  const [currentUser, setCurrentUser] = useState() // owner of the deals

  const [targetDeals, setTargetDeals] = useState([]) // keeps the target Deals

  useEffect(() => {
    ZOHO.embeddedApp.on("PageLoad", function (data) { // initialize the app
      setInitialized(true)
      setEntity(data?.Entity)
      setEntityId(data?.EntityId?.[0])
    });

    ZOHO.embeddedApp.init().then(() => {
      ZOHO.CRM.UI.Resize({height: "800", width:"1300"});
    });
  }, [])

  const todayFormat = () => {
    let date = new Date()
    let year = date.getFullYear()
    let month = date.getMonth()
    let days = date.getDate()
    return `${year}-${month + 1 < 10 ? `0${month + 1}` : month + 1}-${days < 10 ? `0${days}` : days}`;
  }

  const getCurrentMonth = () => {
    const date = new Date()

    switch(date.getMonth()) {
      case 0: return 'Jan';
      case 1: return 'Feb';
      case 2: return 'Mar';
      case 3: return 'Apr';
      case 4: return 'May';
      case 5: return 'Jun';
      case 6: return 'Jul';
      case 7: return 'Aug';
      case 8: return 'Sep';
      case 9: return 'Oct';
      case 10: return 'Nov';
      default: return 'Dec';
    }
  }



  useEffect(() => {
    const fetchData = async () => {
      if(initialized) {
        const salesGoalResp = await ZOHO.CRM.API.getRecord({Entity: entity, RecordID: entityId}) //get the record data for current sales goal
        console.log(salesGoalResp)
        const current_user = salesGoalResp?.data?.[0]?.Owner.id;
        setCurrentUser(salesGoalResp) // set the name of the owner of the goal

        const conn_name = "zoho_crm_conn";
        let req_data = {
          parameters: {
            select_query:
              `select id, Amount, Deal_Name, Decision_Date from Deals where ((Owner = '${current_user}' and Stage not in ('Deal Lost' , 'Lost Request')) and Decision_Date between '2022-01-01' and '${todayFormat()}')`,
          },
          method: "POST",
          url: "https://www.zohoapis.com/crm/v4/coql",
          param_type: 2,
        }
  
        const dealsResp = await ZOHO.CRM.CONNECTION.invoke(conn_name, req_data) // target deals collected
        console.log(dealsResp?.details?.statusMessage?.data)
        setTargetDeals(dealsResp?.details?.statusMessage?.data)
      }
    }
    fetchData();
  }, [initialized, entity, entityId])


  return (
    <Box
      sx={{
        width: "100%",
        p: "2rem 3rem"
      }}
    >
      <Typography sx={{ marginBottom: "2rem" }} variant="h5">Annual Sales Goal for <strong>{currentUser?.data?.[0]?.Owner.name}</strong></Typography>

      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem"
        }}
      >
        <Box
          sx={{
            width: "48%"
          }}
        >
          <ChartCard 
            labelOfChart="Year To Date"
            data={targetDeals}
            colors={["#FF5F6D", "#FFC371"]}
            limit={currentUser?.data?.[0]?.Annual}
            nrOfLevels={2}
          />
        </Box>

        <Box
          sx={{
            width: "48%",
          }}
        >
          <ChartCard 
            labelOfChart="Monthly Target"
            data={targetDeals.filter(deal => {
              return (new Date(deal.Decision_Date) >= new Date('2022-12-31') &&  new Date(deal.Decision_Date) <= new Date('2023-02-01'))
            })}
            colors={["#FF5F6D", "#FFC371"]}
            limit={currentUser?.data?.[0]?.[getCurrentMonth()]}
            nrOfLevels={1}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default App;
