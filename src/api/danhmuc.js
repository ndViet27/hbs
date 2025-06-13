
import axios from 'axios';
const baseURL = import.meta.env.VITE_APP_PATH_API;


export const getDanhMuc = async (filter) => {
  let settings = {
    method: 'get',
    url: `${baseURL}/inspectionmgt/internal/${filter.maDanhMuc}/1.0/filter`,
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

export const getDanhMucEform = async (filter) => {
  let settings = {
    method: 'get',
    url: `${baseURL}/eformmgt/internal/${filter.maDanhMuc}/1.0/filter`,
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

export const getDanhMucCmon = async (filter) => {
  let settings = {
    method: 'get',
    url: `${baseURL}/cmonmgt/internal/${filter.maDanhMuc}/1.0/filter`,
    headers: { 
      'Accept': 'application/json', 
      'Content-Type': 'application/json'
    },
    data: filter.hasOwnProperty('data') ? filter.data : {},
    params: filter.hasOwnProperty('params') ? filter.params : {},
  }
  let data = await axios(settings)
  return data
}

export const getDanhMucPublicadministrativemgt = async (filter) => {
  let settings = {
    method: 'get',
    url: `${baseURL}/publicadministrativemgt/internal/${filter.maDanhMuc}/1.0/filter`,
    headers: { 
      'Accept': 'application/json', 
      'Content-Type': 'application/json'
    },
    data: filter.hasOwnProperty('data') ? filter.data : {},
    params: filter.hasOwnProperty('params') ? filter.params : {},
  }
  let data = await axios(settings)
  return data
} 

