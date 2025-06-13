import axios from 'axios';

const baseURL = import.meta.env.VITE_APP_PATH_API;

export const login = async (filter) => {
  let settings = {
    "url": `${baseURL}/idpmgt/internal/flexauth/oauth2/token`,
    "method": "get",
    "headers": {
      'Accept': 'application/json', 
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + filter.data.base_auth
    },
    params: {},
    data: {}
  };
  
  let data = await axios(settings)
  return data
}

export const getUrlSso = async (filter) => {
  let settings = {
    method: 'post',
    url: `${baseURL}/idpmgt/internal/keycloak/oauth2/authorizeurl`,
    headers: { 
      'Accept': 'application/json', 
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: {
      doi_tuong_su_dung: filter.data.doi_tuong_su_dung,
      redirect_uri: filter.data.redirect_uri
    }
  }
  let data = await axios(settings)
  return data
}

export const getTokenSso = async (filter) => {
  let params = new URLSearchParams()
  for (const key in filter.data) {
    params.append(key, filter.data[key]);
  }
  let settings = {
    method: 'post',
    url: `${baseURL}/idpmgt/internal/keycloak/oauth2/token`,
    headers: { 
      'Accept': 'application/json', 
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: params
  }
  let data = await axios(settings)
  return data
}

export const getThongTinTaiKhoan = async () => {
  let settings = {
    method: 'get',
    url: `${baseURL}/idpmgt/internal/security/profile`,
    headers: { 
      'Accept': 'application/json', 
      'Content-Type': 'application/json'
    },
    params: {},
    data: {}
  }
  let data = await axios(settings)
  return data
}

export const capNhatThongTinTaiKhoan = async (filter) => {
  let settings = {
    method: 'post',
    url: `${baseURL}/${filter.class}/internal/${filter.collection}/1.0/${filter.data.primKey}`,
    headers: { 
      'Accept': 'application/json', 
      'Content-Type': 'application/json'
    },
    data: filter.hasOwnProperty('data') ? JSON.stringify(filter.data) : JSON.stringify({}),
    params: {}
  }
  let data = await axios(settings)
  return data
}

export const doiMatKhau = async (filter) => {
  let settings = {
    method: 'post',
    url: `${baseURL}/idpmgt/internal/security/changepwd`,
    headers: { 
      'Accept': 'application/json', 
      'Content-Type': 'application/json'
    },
    data: filter.hasOwnProperty('data') ? JSON.stringify(filter.data) : JSON.stringify({}),
    params: {}
  }
  let data = await axios(settings)
  return data
}