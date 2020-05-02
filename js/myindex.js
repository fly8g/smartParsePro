function getAddress() {
	let parse_list = smart($('#textarea').val());
	let html = '';
	for (let key in parse_list) {
		if (parse_list[key]) {
			html += '<p><span class="key">' + key + '</span>:<span class="value">' + parse_list[key] + '</span></p>';
		}
	}
	$('#value').html(html);

	$("#province").val(parse_list.provinceCode);
	$("#city").val(parse_list.cityCode);
	$("#county").val(parse_list.countyCode);
	$("#street").val(parse_list.streetCode);

	getCity($("#province").val(), parse_list);
	getCounty($("#city").val(), parse_list);
	getStreet($("#county").val(), parse_list);

}
addressList = pcassCode;
addressList.forEach(function(item, index, input) {
	formatAddresList(item, 1, '');
});
let province = '';
addressList.forEach(function(res, index, input) {
	province += ' <option value="' + res.code + '">' + res.name + '</option>';
});
	
$("#province").html(province);
getCity($("#province").val());
getCounty($("#city").val());
getStreet($("#county").val());

$("#province").change(function() {
	let provinceCode = $("#province").val();
	getCity(provinceCode);
	getCounty($("#city").val());
	getStreet($("#county").val());
});

$("#city").change(function() {
	let cityCode = $("#city").val();
	getCounty(cityCode);
	getStreet($("#county").val());
});

$("#county").change(function() {
	let countyCode = $("#county").val();
	getStreet(countyCode);
});

function getCity(provinceCode, parse_list) {
	let cityList = [];
	let city = '';
	addressList.forEach(function(res, index, input) {
		if (res.code == provinceCode) {
			cityList = res.children;
			return;
		}
	});
	cityList.forEach(function(res, index, input) {
		city += ' <option value="' + res.code + '">' + res.name + '</option>';
	});
	$("#city").html(city);
	if (parse_list) {
		$("#city").val(parse_list.cityCode);
	}
}

function getCounty(cityCode, parse_list) {
	let countyList = [];
	let county = '';
	addressList.forEach(function(el, index, input) {
		el.children.forEach(function(res, index, input) {
			if (res.code == cityCode) {
				countyList = res.children;
				return;
			}
		})
	})

	countyList.forEach(function(res, index, input) {
		county += ' <option value="' + res.code + '">' + res.name + '</option>';
	})
	$("#county").html(county)
	if (parse_list) {
		$("#county").val(parse_list.countyCode);
	}
}

function getStreet(countyCode, parse_list) {
	let streetList = [];
	let street = '';
	addressList.forEach(function(el, index, input) {
		el.children.forEach(function(element, index, input) {
			element.children.forEach(function(res, index, input) {
				if (res.code == countyCode) {
					streetList = res.children;
					return;
				}
			})

		})
	});
	streetList.forEach(function(res, index, input) {
		street += ' <option value="' + res.code + '">' + res.name + '</option>';
	});
	$("#street").html(street);
	if (parse_list) {
		$("#street").val(parse_list.streetCode);
	}
}