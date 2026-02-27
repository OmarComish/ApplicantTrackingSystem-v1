let cacheConfig = null;
export const loadConfig = async()=>{
   if(cacheConfig){
     return cacheConfig;
   }
   try {
    //path to config file...
    const response = await fetch('/config.json');
    if(!response.ok){
        throw new error(`We failed to load config ${response.status}`);
    }
        cacheConfig = await response.json();
        return cacheConfig;
    
   } catch (error) {
      console.error(`We failed to load config settings file ${error}`);
      throw error;
   }
};