import { useCookies } from 'vue3-cookies'
import axios from 'axios'
const { cookies } = useCookies()
const getTokenCookie = function () {
  if (cookies.get('SID_F_ID') && cookies.get('SID_L_ID') && cookies.get('SID_M_ID')) {
    let token = `${cookies.get('SID_F_ID')}.${cookies.get('SID_M_ID')}.${cookies.get('SID_L_ID')}`
    return token
  } else {
    return ''
  }
}
const baseURL = import.meta.env.VITE_APP_PATH_API;

export const getDanhSachDoiTuong = async (filter) => {
  let settings = {
    method: 'get',
    url: `${baseURL}${filter.path}/${filter.collection}/1.0/filter`,
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

export const getChiTietDoiTuong = async (filter) => {
  let settings = {
    method: 'get',
      url: `${baseURL}${filter.path}/${filter.collection}/1.0/${filter.primKey}`,
    headers: { 
      'Accept': 'application/json', 
      'Content-Type': 'application/json'
    },
    data: {},
    params: filter.hasOwnProperty('params') ? filter.params : {}
  }
  let data = await axios(settings)
  return data
}

export const themMoiDoiTuong = async (filter) => {
  let settings = {
    method: 'post',
    url: `${baseURL}${filter.path}/${filter.collection}/1.0`,
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

export const capNhatDoiTuongMany = async (filter) => {
  let settings = {
    method: 'post',
    url: `${baseURL}${filter.path}/${filter.collection}/1.0/updatemany`,
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

export const capNhatDoiTuong = async (filter) => {
  let settings = {
    method: 'post',
    url: `${baseURL}${filter.path}/${filter.collection}/1.0/${filter.data.primKey}`,
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

export const xoaDoiTuong = async (filter) => {
  let settings = {
    method: 'delete',
    url: `${baseURL}${filter.path}/${filter.collection}/1.0/${filter.data.primKey ? filter.data.primKey : filter.data.MaDinhDanh}`,
    headers: { 
      'Accept': 'application/json', 
      'Content-Type': 'application/json'
    },
    data: {},
    params: {}
  }
  let data = await axios(settings)
  return data
}

export const getData = async (filter) => {
  let settings = {
    method: 'get',
    url: `${baseURL}${filter.api}`,
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
export const getDanhSachThaoTacThucHien = async (filter) => {
  let settings = {
    method: 'get',
    url: `${baseURL}/cmonmgt/internal/sodotrangthai/1.0/gethanhdong`,
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

export const getThongKeTheoTrangThai = async (filter) => {
  let settings = {
    method: 'get',
    url: `${baseURL}${filter.path}/${filter.collection}/1.0/statistic`,
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


export const exportDsDoiTuong = async (filter) => {
  let settings = {
    method: 'get',
    url: `${baseURL}${filter.path}/export/1.0/${filter.collection}`,
    headers: { 
      'Content-Type': 'application/json'
    },
    responseType: 'blob',
    params: filter.hasOwnProperty('params') ? filter.params : {}
  }
  let response = await axios(settings)
  let urlFile = window.URL.createObjectURL(response)
  return urlFile
}

export const docxToPdf = async (dataBase64) => {
  let settings = {
    method: 'post',
    url: `https://hbsapi-staging.gov.vn/docx2pdf/internal/convert`,
    headers: { 
      'Accept': 'application/json', 
      'Content-Type': 'application/json'
    },
    data: dataBase64 ? JSON.stringify(dataBase64) : JSON.stringify({}),
    responseType: 'blob',
    params: {}
  }
  let data = await axios(settings)
  return data
}

export const uploadTepTemplate = async (fileUpload) => {
  let form = new FormData()
  form.append("file", fileUpload)
  let headers = {
    'Accept': 'application/json',
  }
  if (cookies.get('Token', '')) {
    headers['Authorization'] = 'Bearer ' + cookies.get('Token', '') 
  }
  let tokenCsrf = getTokenCookie()
  if (tokenCsrf) {
    headers['Authorization'] = 'Bearer ' + tokenCsrf
  }
  let data =  await fetch(`${baseURL}/storagemgt/internal/device/1.0/public/upload`, {
    method: "POST", 
    body: form,
    headers: headers
  });
  let jsonData = await data.json()
  return jsonData
}

export const uploadTepKySo = async (fileUpload) => {
  let form = new FormData()
  form.append("file", fileUpload)
  let headers = {
    'Accept': 'application/json',
  }
  if (cookies.get('Token', '')) {
    headers['Authorization'] = 'Bearer ' + cookies.get('Token', '') 
  }
  let tokenCsrf = getTokenCookie()
  if (tokenCsrf) {
    headers['Authorization'] = 'Bearer ' + tokenCsrf
  }
  let data =  await fetch(`${baseURL}/storagemgt/internal/device/1.0/kyso/upload`, {
    method: "POST", 
    body: form,
    headers: headers
  });
  let jsonData = await data.json()
  return jsonData
}
export const uploadTep = async (fileUpload) => {
  let form = new FormData()
  form.append("file", fileUpload)
  let data = await fetch(`${baseURL}/storagemgt/internal/device/1.0/upload`, {
    method: "POST",
    body: form,
    headers: {
      'Accept': 'application/json',
      // 'Authorization': 'Bearer ' + cookies.get('Token'),
      'Session-Id': cookies.get('Session-Id')
    }
  });
  let jsonData = await data.json()
  return jsonData
}

export const taiTep = async (file) => {
  let config = {
    method: 'get',
    url: `${baseURL}/storagemgt/internal/tepdulieu/1.0/download/${file.MaDinhDanh}`,
    headers: { 
      'Content-Type': 'application/json'
    },
    responseType: 'blob'
  }

  let response = await axios(config)
  let urlFile = window.URL.createObjectURL(response)
  return urlFile
}

export const capNhatKySoGiayTo = async (filter) => {
  let settings = {
    method: 'post',
    url: `${baseURL}/publicadministrativemgt/internal/hosodichvucong/1.0/kyso/${filter.collection}`,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Session-Id': cookies.get('Session-Id')
    },
    data: filter.hasOwnProperty('data') ? JSON.stringify(filter.data) : JSON.stringify({}),
    params: filter.hasOwnProperty('params') ? filter.params : {}
  }
  let data = await axios(settings)
  return data
}

export const taiTepBlob = async (file) => {
  let config = {
    method: 'get',
    url: `${baseURL}/storagemgt/internal/tepdulieu/1.0/download/${file.MaDinhDanh}`,
    headers: {
      'Content-Type': 'application/json',
      'Session-Id': cookies.get('Session-Id')
    },
    responseType: 'blob'
  }

  let response = await axios(config)
  return response
}