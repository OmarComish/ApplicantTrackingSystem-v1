import { useState, useEffect } from "react";
import { loadConfig } from "../Config/ConfigLoader";

export function useConfig(){
    const [config, setConfig] = useState(null);
    const [loading, setLoading] =useState(true);

    useEffect(()=>{
        loadConfig()
        .then(setConfig)
        .catch(console.error)
        .finally(()=>setLoading(false))
    },[]);

    return{config, loading};
}