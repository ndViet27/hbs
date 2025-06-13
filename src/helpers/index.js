export const dateTwoCharacter = function (date) {
  if (!date) return null
  const [day, month, year] = date.split('/')
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
}
export const dateLocale = function (dateInput) {
  if (!dateInput) return ''
  let date = new Date(dateInput)
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
}
export const dateLocaleTime = function(dateInput) {
  let date = new Date(dateInput)
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}
export const dateLocaleToTimestamp = function (date) {
  if (!date) return ''
  const [day, month, year] = date.split('/')
  let ddd = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  return (new Date(ddd)).getTime()
}
export const dateIsoLocal = function (data) {
  if (!data) {
    return ''
  }
  let date = new Date(data)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const zone = String(-(new Date().getTimezoneOffset() / 60)).padStart(2,0);
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}
export const formatThousandSeparator = function (value) {
  if (value) {
    let moneyCur = String(value).includes(".")
      ? (Number(value) / 1).toFixed(2).toString().replace(".", ",")
      : (Number(value) / 1).toFixed(0).replace(".", ",");
    return moneyCur.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  return "";
}
export const formatNumber = function (value) {
  if (!value) return "";
  let cv = function (value) {
    if (value) {
      let moneyCur = value.includes(".")
        ? (Number(value) / 1).toFixed(2).toString().replace(".", ",")
        : (Number(value) / 1).toFixed(0).replace(".", ",");
      return moneyCur.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    return "";
  }
  value = String(value).replace(/[^\d.,]/g, "");
  const parts = value.split(",");
  if (parts[0].length >= 4) {
    parts[0] = parts[0].includes(".")
      ? cv(parts[0])
      : cv(parts[0].replace(/\./g, ""));
  }
  return parts.join(",");
}
export const addressToString = function (ad) {
  if (!ad) return ""
  let strAd = ""
  if (ad.SoNhaChiTiet) {
    strAd += ad.SoNhaChiTiet
  }
  if (ad?.XaPhuong?.TenMuc) {
    strAd += `, ${ad?.XaPhuong?.TenMuc}`
  }
  if (ad?.HuyenQuan?.TenMuc) {
    strAd += `, ${ad?.HuyenQuan?.TenMuc}`
  }
  if (ad?.TinhThanh?.TenMuc) {
    strAd += `, ${ad?.TinhThanh?.TenMuc}`
  }
  return strAd
}
export function arrayToString(arr, name) {
  if (!arr || !arr.length) return ''
  
  let arrayString = ''
  if (name) {
    let arrConvert = Array.from(arr, (item) => item[name])
    arrayString = arrConvert.toString()
  } else {
    arrayString = arr.toString()
  }
  
  return arrayString.replace(/,/g, ", ")
}
export const sortDs = function(array, key, ascending) {
  if (ascending) {
    return array.sort((a, b) => (a[key] > b[key] ? 1 : -1));
  } else {
    return array.sort((a, b) => (a[key] < b[key] ? 1 : -1));
  }
}
export const getValue = function (obj, key) {
  const keys = key ? key.split('.') : []
  if (keys.length === 0) return ''
  let value = obj
  for (let i = 0; i < keys.length; i++) {
    if (value && typeof value === 'object' && keys[i] in value) {
      value = value[keys[i]]
    } else {
      return ''
    }
  }
  return value
}
export const mergeAndSortHeaders = function (headers) {
  if (!headers) return [];
  // Trường hợp tableHeaders là mảng 2 chiều (cấu trúc hàng/cột)
  if (Array.isArray(headers) && Array.isArray(headers[0])) {
    // Flatten: gộp các hàng trong tableHeaders thành một mảng phẳng
    const flattenedHeaders = headers.flat();
    // Sort theo key
    return flattenedHeaders.sort((a, b) => {
      // Xử lý key dạng "x.y"
      const parseKey = (key) => {
        if (typeof key === 'string' && key.includes('.')) {
          const [main, sub] = key.split('.');
          return { main: parseInt(main), sub: parseInt(sub) };
        }
        return { main: parseInt(key), sub: 0 };
      };
      const keyA = parseKey(a.key);
      const keyB = parseKey(b.key);
      // So sánh main trước
      if (keyA.main !== keyB.main) {
        return keyA.main - keyB.main;
      }
      // Sau đó so sánh sub
      return keyA.sub - keyB.sub;
    });
  }
  // Trường hợp đã là mảng một chiều
  return headers;
}
export const base64ToBlob = function (base64String, fileName, mimeType) {
  const byteCharacters = atob(base64String)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: mimeType })
  return blob
}
/**
 * Chuyển đổi newQuery và mauTimKiem thành searchParams chuẩn cho filter/search
 * @param {Object} newQuery - Query object (ví dụ: từ route.query)
 * @param {Array} mauTimKiem - Mảng cấu hình các trường tìm kiếm
 * @returns {Object} searchParams
 */
export function buildSearchParams(newQuery, mauTimKiem) {
  const searchParams = {}
  for (const key in newQuery) {
    if (["page", "size", "keyword"].includes(key)) continue
    const fieldDef = mauTimKiem.find((field) => field.name === key)

    if (fieldDef) {
      if (fieldDef.type === "select") {
        if (fieldDef.multiple) {
          // Xử lý trường select nhiều giá trị
          const values = newQuery[key].split(",")
          if (!fieldDef.returnObject) {
            // Nếu return-object là false, giữ nguyên giá trị primitive
            searchParams[key] = values
          } else {
            // Nếu return-object là true hoặc không được định nghĩa, tạo đối tượng
            if (fieldDef.dataSource && fieldDef.dataSource.length > 0) {
              // Nếu đã có sẵn dataSource, tìm đối tượng dựa trên giá trị
              searchParams[key] = values.map((value) => {
                const found = fieldDef.dataSource.find(
                  (item) =>
                    item[fieldDef.mapping || fieldDef.itemValue] == value
                )
                return (
                  found || { [fieldDef.mapping || fieldDef.itemValue]: value }
                )
              })
            } else {
              // Nếu chưa có dataSource, tạo đối tượng tạm thời
              searchParams[key] = values.map((value) => ({
                [fieldDef.mapping || fieldDef.itemValue]: value,
              }))
            }
          }
        } else {
          // Xử lý trường select một giá trị
          if (!fieldDef.returnObject) {
            // Nếu return-object là false, giữ nguyên giá trị primitive
            searchParams[key] = newQuery[key]
          } else {
            // Nếu return-object là true hoặc không được định nghĩa, tạo đối tượng
            if (fieldDef.dataSource && fieldDef.dataSource.length > 0) {
              // Nếu đã có sẵn dataSource, tìm đối tượng dựa trên giá trị
              const found = fieldDef.dataSource.find(
                (item) =>
                  item[fieldDef.mapping || fieldDef.itemValue] == newQuery[key]
              )
              searchParams[key] = found || {
                [fieldDef.mapping || fieldDef.itemValue]: newQuery[key],
              }
            } else {
              // Nếu chưa có dataSource, tạo đối tượng tạm thời
              searchParams[key] = {
                [fieldDef.mapping || fieldDef.itemValue]: newQuery[key],
              }
            }
          }
        }
      } else {
        // Xử lý các loại trường khác
        searchParams[key] = newQuery[key]
      }
    } else {
      searchParams[key] = newQuery[key]
    }
  }
  return searchParams
}

export const convertNameFile = (input) => {
  const result = input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
  return result
}

export const blobToBase64 = function (blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      resolve(reader.result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
