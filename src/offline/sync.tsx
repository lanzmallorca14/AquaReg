import { aquaOfflineDB } from "./db";
import { SupabaseClient } from "@supabase/supabase-js";



// =================================================
// SAVE OFFLINE VESSEL
// =================================================

export async function saveOfflineVessel(
  data:any
){

  const db = await aquaOfflineDB;


  await db.put(
    "Vessels",
    {
      ...data,
      sync_status:"pending",
      created_at:new Date().toISOString()
    }
  );


  await db.add(
    "syncQueue",
    {
      action:"INSERT",
      table:"Vessels",
      data:data,
      created_at:new Date().toISOString()
    }
  );

}


// =================================================
// SAVE OFFLINE PERMIT
// =================================================

export async function saveOfflinePermit(
  data:any
){

  const db = await aquaOfflineDB;


  await db.put(
    "permit_management",
    {
      ...data,
      sync_status:"pending",
      created_at:new Date().toISOString()
    }
  );


  await db.add(
    "syncQueue",
    {
      action:"INSERT",
      table:"permit_management",
      data:data,
      created_at:new Date().toISOString()
    }
  );

}




// =================================================
// SAVE OFFLINE INSPECTION
// =================================================

export async function saveOfflineInspection(
  data:any
){

  const db = await aquaOfflineDB;


  await db.put(
    "COI",
    {
      ...data,
      sync_status:"pending",
      created_at:new Date().toISOString()
    }
  );



  await db.add(
    "syncQueue",
    {
      action:"INSERT",
      table:"COI",
      data:data,
      created_at:new Date().toISOString()
    }
  );

}







// =================================================
// SYNC OFFLINE DATA
// =================================================

export async function syncOfflineData(
  supabase: SupabaseClient
) {

  const db = await aquaOfflineDB;

  const queue = await db.getAll("syncQueue");


  for (const item of queue) {


    // ============================
    // INSERT SYNC
    // ============================

  

      if (item.action === "INSERT") {

  const { error } = await supabase
    .from(item.table)
    .upsert(item.data);

      if (!error) {

        await db.delete(
          "syncQueue",
          item.queue_id
        );


        if (item.table === "Vessels") {

          await db.put(
            "Vessels",
            {
              ...item.data,
              sync_status:"synced"
            }
          );

        }


      if (
 item.table === "COI" ||
 item.table === "permit_management"
) {

  await db.put(
    item.table,
    {
      ...item.data,
      sync_status:"synced"
    }
  );



        }


      } else {

        console.error(
          "INSERT Sync failed:",
          item.table,
          error
        );

      }

    }



    // ============================
    // UPDATE SYNC
    // ============================

    if (item.action === "UPDATE") {


      const { error } = await supabase
        .from(item.table)
        .update(item.data)
        .eq("id", item.id);



      if (!error) {


        await db.delete(
          "syncQueue",
          item.queue_id
        );

if (
 item.table === "Vessels" &&
 ["PASSED","REGISTERED"].includes(
   String(item.data.status || "").toUpperCase()
 )
){

          await db.put(
            "Vessels",
            {
              ...item.data,
              sync_status:"synced"
            }
          );

        }


      } else {

        console.error(
          "UPDATE Sync failed:",
          item.table,
          error
        );

      }

    }


  }

}