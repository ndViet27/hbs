
import axios from 'axios';
const baseURL = import.meta.env.VITE_APP_PATH_API;


export const getCounterHoSoTheoTrangThai = async (filter) => {
  let settings = {
    method: 'get',
    url: `${baseURL}/publicadministrativemgt/internal/hosodichvucong/1.0/trangthaihoso/distinct`,
    headers: { 
      'Accept': 'application/json', 
      'Content-Type': 'application/json'
    },
    data: filter.hasOwnProperty('data') ? filter.data : {},
    params: filter.hasOwnProperty('params') ? filter.params : {}
  }
  let data = await axios(settings)
  return data
}

