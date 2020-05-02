/*
function indexOf(arr, value) {
	if (!arr || !value) {
		return -1;
	}
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] === value){
			return i;
		}
	}
	return -1;
}
*/

function indexOf(pStr, cStr, n) {
	if (!pStr || !cStr) {
		return -1;
	}
	
	// n为起始位置
	let i = 0; // 循环变量
	let len1 = pStr.length; // 父串长度
	let len2 = cStr.length; // 子串长度

	if (n == undefined || n == null || n === -1) {
		i = 0;
	} else if (n > len1 - 1) { // 如果起始位置大于父串最后一位，返回-1，不存在
		return -1;
	} else { // 如果不存在上述情况，从第n位开始
		i = n;
	}

	if (len2 > len1) { // 如果子串长度大于父串，那么肯定不存在，返回-1
		return -1;
	} else if (len2 === len1) { // 如果相等，那就直接对比两个字符串是否相等
		if (cStr === pStr) { // 如果内容相等，那么就是从第一位开始的
			return 0;
		} else { // 如果长度不相等，那么返回-1
			return -1;
		}
	} else {
		let tempStr = '';
		while (i < len1) {
			// 截取父串，起始位置为i，每次长度为子串长度
			tempStr = pStr.substr(i, len2);
			if (cStr === tempStr) {
				return i; // 返回字符串第一次出现的位置
			}
			i++; 
		}

		if (i === len1) { // 直到父元素的最后一位还没有出现相等，那么就是不存在返回-1
		  return -1;
		}
	}
}



var addressList = []; //地址列表
var zipCodeList = []; //邮编列表

//获取地址以及邮编json
/* const getJson = new Promise((res, rej) function(event, index, input) {
    $.getJSON("./json/pcas-code.json", data_address function(event, index, input) {
        $.getJSON("./json/zip-code.json", data_code function(event, index, input) {

            res({
                'address': data_address,
                'code': data_code
            })
        })
    })
})

getJson.then((res) function(event, index, input) {
    addressList = res.address;
    addressList.forEach(function(item, index, input) {
        formatAddresList(item, 1, '')
    })
    zipCodeList = zipCodeFormat(res.code);
}) */


/**
 * 地址数据处理
 * @param addressList-各级数据对象
 * @param index-对应的省/市/县区/街道
 * @param province-只有直辖市会处理为  北京市北京市
 * @returns <array>
 */
function formatAddresList(addressList, index, province) {
  if (index === 1) {
    //省
    addressList.province = addressList.name;
    addressList.type ='province';
  } else if (index === 2) {
    //市
    if (addressList.name == '市辖区') {
      addressList.name = province.name;
    }
    addressList.city = addressList.name;
    addressList.type ='city';
  } else if (index === 3) {
    //区或者县
    addressList.county = addressList.name;
    addressList.type ='county';
  } else if (index === 4) {
    //街道
    addressList.street = addressList.name;
    addressList.type ='street';
  }
  if (addressList.children) {
    index++;
    addressList.children.forEach(function(res, index1, input) {
      formatAddresList(res, index, addressList);
    });
  }
}

/**
 * 解析邮编
 * @param
 * @returns <array>
 */
function zipCodeFormat(zipCode) {
  let list = [];
  zipCode.forEach(function(el, index, input) {
    if (el.child) {
      el.child.forEach(function(event, index, input) {
        if (event.child) {
          event.child.forEach(function(element, index, input) {
            list.push(element.zipcode);
          });
        }
      });
    }
  });
  return list;
}


addressList = pcassCode;
addressList.forEach(function(item, index, input) {
  formatAddresList(item, 1, '');
});
zipCodeList = zipCodeFormat(zipCode);

var smartObj = {};
/**
 * 解析邮编
 * @param event识别的地址
 * @returns <obj>
 */
function smart(event) {
  event = stripscript(event); //过滤特殊字符
  let obj = {};
  let objStr = "";
  let copyaddress = JSON.parse(JSON.stringify(event));
  copyaddress = copyaddress.split(' ');

  copyaddress.forEach(function(res, index, input) {
    if (res) {
      if (res.length == 1) {
        res += 'XX'; // 过滤掉一位的名字或者地址
      }
      let addressObj = smatrAddress(res);
	  let objStrTmp = JSON.stringify(addressObj);
      if (objStrTmp === '{}') {
		addressObj.name = res.replace('XX', '');
      }
	  objStrTmp = JSON.stringify(addressObj);
	  let objStrTmp2 = objStrTmp.replace("{", "").replace("}", "");
	  if (objStr != "") {
		objStr += ", ";
	  }
	  if (objStrTmp2 != "") {
		objStr += objStrTmp2;
	  }
    }
  });

  if (objStr) {
	obj = JSON.parse("{" + objStr + "}");
  }
  return obj;
}

function smatrAddress(event) {
  smartObj = {};
  let address = event;
  //address=  event.replace(/\s/g, ''); //去除空格
  address = stripscript(address); //过滤特殊字符

  //身份证号匹配
  if (IdentityCodeValid(address)) {
    smartObj.idCard = address;
    address = address.replace(address, '');
  }

  //电话匹配
  let phone = address.match(
    /(86-[1][0-9]{10}) | (86[1][0-9]{10})|([1][0-9]{10})/g
  );
  if (phone) {
    smartObj.phone = phone[0];
    address = address.replace(phone[0], '');
  }

  //邮编匹配
  zipCodeList.forEach(function(res, index, input) {
    if (indexOf(address, res) != -1) {
      let num = indexOf(address, res);
      let code = address.slice(num, num + 6);
      smartObj.zipCode = code;
      address = address.replace(code, '');
    }
  });
  let matchAddress = '';
  //省匹配 比如输入北京市朝阳区，会用北  北京  北京市 北京市朝 以此类推在addressList里的province中做匹配，会得到北京市  河北省 天津市等等；
  let matchProvince = []; //粗略匹配上的省份
  // for (let begIndex = 0; begIndex < address.length; begIndex++) {
  matchAddress = '';
  for (let endIndex = 0; endIndex < address.length; endIndex++) {
    //  if (endIndex > begIndex) {
    matchAddress = address.slice(0, endIndex + 2);
    addressList.forEach(function(res, index, input) {
      if (indexOf(res['province'], matchAddress) != -1) {
        matchProvince.push({
          province: res.province,
          provinceCode: res.code,
          matchValue: matchAddress
        });
      }
    });
    // }
  }
  //  }

  //统计筛选初略统计出的省份
  matchProvince.forEach(function(res, index, input) {
    res.index = 0;
    matchProvince.forEach(function(el, index, input) {
      if (res.province == el.province) {
        el.index++;
        if (res.matchValue.length > el.matchValue.length) {
          el.matchValue = res.matchValue;
        }
      }
    });
  });
  if (matchProvince.length != 0) {
    let province = matchProvince.reduce(function(p, v) {
    	return p.index < v.index ? v : p;
    });
    smartObj.province = province.province;
    smartObj.provinceCode = province.provinceCode;
    address = address.replace(province.matchValue, '');
  }
  //市查找
  let matchCity = []; //粗略匹配上的市
  matchAddress = '';
  for (let endIndex = 0; endIndex < address.length; endIndex++) {
    matchAddress = address.slice(0, endIndex + 2);
    addressList.forEach(function(el, index, input) {
      //  if (el.name == smartObj.province) {
      if (el.code == smartObj.provinceCode || !smartObj.provinceCode ) {
        if (
          smartObj.province == '北京市' ||
          smartObj.province == '天津市' ||
          smartObj.province == '上海市' ||
          smartObj.province == '重庆市'
        ) {
          el.children.forEach(function(item, index, input) {
            item.children.forEach(function(res, index, input) {
              if (indexOf(res['county'], matchAddress) != -1) {
                matchCity.push({
                  county: res.county,
                  countyCode: res.code,
                  city: item.city,
                  cityCode: item.code,
                  matchValue: matchAddress,
                  province: el.province,
                  provinceCode: el.code
                });
              }
            });
          });
        } else {
          el.children.forEach(function(res, index, input) {
            if (indexOf(res['city'], matchAddress) != -1) {
              matchCity.push({
                city: res.city,
                cityCode: res.code,
                matchValue: matchAddress,
                province: el.province,
                provinceCode: el.code
              });
            }
          });
        }
      }
      // }
    });
  }

  //统计筛选初略统计出的市
  matchCity.forEach(function(res, index, input) {
    res.index = 0;
    matchCity.forEach(function(el, index, input) {
      if (res.city == el.city) {
        el.index++;
        if (res.matchValue.length > el.matchValue.length) {
          el.matchValue = res.matchValue;
        }
      }
    });
  });
  if (matchCity.length != 0) {
    let city = matchCity.reduce(function(p, v) {
    	return p.index < v.index ? v : p;
    });
    smartObj.city = city.city;
    smartObj.cityCode = city.cityCode;
    smartObj.county = city.county;
    smartObj.countyCode = city.countyCode;
    if (!smartObj.province) {
      smartObj.province = city.province;
      smartObj.provinceCode = city.provinceCode;
    }
    address = address.replace(city.matchValue, '');
  }

  //区县查找
  let matchCounty = []; //粗略匹配上的区县
  matchAddress = '';
  for (let endIndex = 0; endIndex < address.length; endIndex++) {
    matchAddress = address.slice(0, endIndex + 2);
    addressList.forEach(function(el, index, input) {
      //  if (el.name == smartObj.province) {
      if (
        smartObj.province == '北京市' ||
        smartObj.province == '天津市' ||
        smartObj.province == '上海市' ||
        smartObj.province == '重庆市'
      ) {
        //nothing
      } else {
        el.children.forEach(function(item, index, input) {
          //  if (item.name == smartObj.city) {
          item.children.forEach(function(res, index, input) {
            if (indexOf(res['county'], matchAddress) != -1) {
              //省/市  || 省 
              if (smartObj.province) {
                if (res.code.slice(0, 4) == smartObj.cityCode) {
                  matchCounty.push({
                    county: res.county,
                    countyCode: res.code,
                    city: item.city,
                    cityCode: item.code,
                    matchValue: matchAddress,
                    province: el.province,
                    provinceCode: el.code
                  });
                }
              } else if(!smartObj.province && !smartObj.city){
                matchCounty.push({
                  county: res.county,
                  countyCode: res.code,
                  city: item.city,
                  cityCode: item.code,
                  matchValue: matchAddress,
                  province: el.province,
                  provinceCode: el.code
                });
              }
            }
          });
          //  }
        });
      }
      //  }
    });
  }
  //统计筛选初略统计出的区县
  matchCounty.forEach(function(res, index, input) {
    res.index = 0;
    matchCounty.forEach(function(el, index, input) {
      if (res.city == el.city) {
        el.index++;
        if (res.matchValue.length > el.matchValue.length) {
          el.matchValue = res.matchValue;
        }
      }
    });
  });
  if (matchCounty.length != 0) {
    let city = matchCounty.reduce(function(p, v) {
    	return p.index < v.index ? v : p;
    });
    smartObj.county = city.county;
    smartObj.countyCode = city.countyCode;
    if (!smartObj.province) {
      smartObj.province = city.province;
      smartObj.provinceCode = city.provinceCode;
    }
    if (!smartObj.city) {
      smartObj.city = city.city;
      smartObj.cityCode = city.cityCode;
    }
    address = address.replace(city.matchValue, '');
  }
  
  //街道查找
  let matchStreet = []; //粗略匹配上的街道查
  matchAddress = '';
  for (let endIndex = 0; endIndex < address.length; endIndex++) {
    matchAddress = address.slice(0, endIndex + 3);
    addressList.forEach(function(el, index, input) {
      if (el.name == smartObj.province) {
        if (
          smartObj.province == '北京市' ||
          smartObj.province == '天津市' ||
          smartObj.province == '上海市' ||
          smartObj.province == '重庆市'
        ) {
          //nothing
        } else {
          el.children.forEach(function(element, index, input) {
            if (element.name == smartObj.city) {
              element.children.forEach(function(item, index, input) {
                if (item.name == smartObj.county) {
                  item.children.forEach(function(res, index, input) {
                    if (indexOf(res['street'], matchAddress) != -1) {
                      matchStreet.push({
                        street: res.street,
                        streetCode: res.code,
                        matchValue: matchAddress
                      });
                    }
                  });
                }
              });
            }
          });
        }
      }
    });
  }

  //统计筛选初略统计出的区县
  matchStreet.forEach(function(res, index, input) {
    res.index = 0;
    matchStreet.forEach(function(el, index, input) {
      if (res.city == el.city) {
        el.index++;
        if (res.matchValue.length > el.matchValue.length) {
          el.matchValue = res.matchValue;
        }
      }
    });
  });

  if (matchStreet.length != 0) {
    let city = matchStreet.reduce(function(p, v) {
    	return p.index < v.index ? v : p;
    });
    smartObj.street = city.street;
    smartObj.streetCode = city.streetCode;
    address = address.replace(city.matchValue, '');
  }
  //姓名查找
  if (smartObj.province) {
    smartObj.address = address;
  }

  return smartObj;
}
////过滤特殊字符
function stripscript(s) {
  s = s.replace(/(\d{3})-(\d{4})-(\d{4})/g, '$1$2$3');
  s = s.replace(/(\d{3}) (\d{4}) (\d{4})/g, '$1$2$3');
  var pattern = new RegExp(
    "[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“’。，、？-]"
  );
  var rs = '';
  for (var i = 0; i < s.length; i++) {
    rs = rs + s.substr(i, 1).replace(pattern, ' ');
  }
  rs = rs.replace(/[\r\n]/g, '');
  return rs;
}

function IdentityCodeValid(code) {
  let pass;
  var city = {
    11: '北京',
    12: '天津',
    13: '河北',
    14: '山西',
    15: '内蒙古',
    21: '辽宁',
    22: '吉林',
    23: '黑龙江 ',
    31: '上海',
    32: '江苏',
    33: '浙江',
    34: '安徽',
    35: '福建',
    36: '江西',
    37: '山东',
    41: '河南',
    42: '湖北 ',
    43: '湖南',
    44: '广东',
    45: '广西',
    46: '海南',
    50: '重庆',
    51: '四川',
    52: '贵州',
    53: '云南',
    54: '西藏 ',
    61: '陕西',
    62: '甘肃',
    63: '青海',
    64: '宁夏',
    65: '新疆',
    71: '台湾',
    81: '香港',
    82: '澳门',
    91: '国外 '
  };
  var tip = '';
  pass = true;

  if (!code || !/^\d{17}(\d|X)$/i.test(code)) {
    tip = '身份证号格式错误';
    pass = false;
  } else if (!city[code.substr(0, 2)]) {
    tip = '地址编码错误';
    pass = false;
  } else {
    //18位身份证需要验证最后一位校验位
    if (code.length == 18) {
      code = code.split('');
      //∑(ai×Wi)(mod 11)
      //加权因子
      var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
      //校验位
      var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
      var sum = 0;
      var ai = 0;
      var wi = 0;
      for (var i = 0; i < 17; i++) {
        ai = code[i];
        wi = factor[i];
        sum += ai * wi;
      }
      var last = parity[sum % 11];
      if (parity[sum % 11] != code[17]) {
        tip = '校验位错误';
        pass = false;
      }
    }
  }
  return pass;
}
