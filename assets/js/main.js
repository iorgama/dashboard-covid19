const urlApi = 'https://api.covid19api.com';

/*****
 * Methods
 ****/

const setInitialValues = () => {
  document.querySelector('#combo').addEventListener('change', selectEvent);
  document.querySelector('#today').addEventListener('change', selectDate);

  fixInputDate();
  getCountry();
  getSummary();
  selectEvent();
};

const fixInputDate = () => {
  const tmpDate = new Date(Date.now());
  const dateInputFormatted = formatDate(tmpDate);
  document.querySelector('#today').value = dateInputFormatted;
};
const fixSelect = (result) => {
  const select = document.querySelector('#combo');
  response = result.map((item) => {
    select.appendChild(new Option(item.Country, item.Slug));
  });
};

const selectEvent = (event) => {
  if (event) {
    const slug = event.target.value;
    const date = document.querySelector('#today').value.replaceAll('-', '/');
    getCountryAllStatus(date, slug);
  }
};

const selectDate = (event) => {
  const slug = document.querySelector('#combo').value;
  if (event && slug != 'Global') {
    const date = event.target.value.replaceAll('-', '/');
    getCountryAllStatus(date, slug);
  }
};

const showTotal = (result) => {
  const pConfirmed = document.querySelector('#confirmed');
  pConfirmed.innerHTML = formatNumber(result.totalConfirmados);
  const pDeath = document.querySelector('#death');
  pDeath.innerHTML = formatNumber(result.totalMortes);
  const pRecovered = document.querySelector('#recovered');
  pRecovered.innerHTML = formatNumber(result.totalRecuperados);
  const h5Actives = document.querySelector('#actives');
  h5Actives.innerHTML = 'Atualização';
  const pActive = document.querySelector('#active');
  pActive.innerHTML = result.atualizacao
    .split('T')[0]
    .split('-')
    .reverse()
    .join('/');
};

const showTotalCountry = (result) => {
  const pConfirmed = document.querySelector('#confirmed');
  pConfirmed.innerHTML = formatNumber(result.totalConfirmados);
  const tconfirmed = document.querySelector('#tconfirmed');
  tconfirmed.innerHTML = formatNumber(result.dConfirmados);
  image = result.dConfirmados > 0 ? 'up' : 'down';
  tconfirmed.innerHTML = `<img src="./assets/img/${image}.png">${formatNumber(
    result.dConfirmados,
  )}`;

  const pDeath = document.querySelector('#death');
  pDeath.innerHTML = formatNumber(result.totalMortes);
  const tdeath = document.querySelector('#tdeath');
  tdeath.innerHTML = formatNumber(result.dMortes);
  image = result.dMortes > 0 ? 'up' : 'down';
  tdeath.innerHTML = `<img src="./assets/img/${image}.png">${formatNumber(
    result.dMortes,
  )}`;

  const pRecovered = document.querySelector('#recovered');
  pRecovered.innerHTML = formatNumber(result.totalRecuperados);
  const trecovered = document.querySelector('#trecovered');
  trecovered.innerHTML = formatNumber(result.dRecuperados);
  image = result.dRecuperados > 0 ? 'up' : 'down';
  trecovered.innerHTML = `<img src="./assets/img/${image}.png">${formatNumber(
    result.dRecuperados,
  )}`;

  const h5Actives = document.querySelector('#actives');
  h5Actives.innerHTML = 'Ativos';
  const pActive = document.querySelector('#active');
  pActive.innerHTML = formatNumber(result.totalAtivos);
  const tactive = document.querySelector('#tactive');
  image = result.dAtivos > 0 ? 'up' : 'down';
  tactive.innerHTML = `<img src="./assets/img/${image}.png">${formatNumber(
    result.dAtivos,
  )}`;
};

/******
 * API
 ******/

const getCountryAllStatus = async (date, country) => {
  try {
    const requestOptions = {
      method: 'GET',
      redirect: 'follow',
    };

    const currentDate = new Date(date);
    const previousDate = new Date(currentDate - 1 * 24 * 60 * 60 * 1000);
    currentDate.setUTCHours(0, 0, 0, 0);
    previousDate.setUTCHours(0, 0, 0, 0);
    const urlParams = `${urlApi}/country/${country}?from=${previousDate.toISOString()}&to=${currentDate.toISOString()}`;

    const result = await fetchJson(urlParams, requestOptions);
    if (result.length > 1) {
      resultByDay = result.reduce(
        (item, resultsByCountry) => {
          item.dAtivos = resultsByCountry.Active - item.dAtivos;
          item.dMortes = resultsByCountry.Deaths - item.dMortes;
          item.dConfirmados = resultsByCountry.Confirmed - item.dConfirmados;
          item.dRecuperados = resultsByCountry.Recovered - item.dRecuperados;
          return item;
        },
        {
          dAtivos: 0,
          dConfirmados: 0,
          dMortes: 0,
          dRecuperados: 0,
        },
      );

      data = {
        totalConfirmados: result[1].Confirmed,
        totalMortes: result[1].Deaths,
        totalRecuperados: result[1].Recovered,
        totalAtivos: result[1].Active,
        dAtivos: resultByDay.dAtivos,
        dConfirmados: resultByDay.dConfirmados,
        dMortes: resultByDay.dMortes,
        dRecuperados: resultByDay.dRecuperados,
      };

      showTotalCountry(data);
    }

    throw 'Dados indisponíveis!';
  } catch (e) {
    return e;
  }
};
const getCountry = async () => {
  try {
    const requestOptions = {
      method: 'GET',
      redirect: 'follow',
    };
    const urlParams = `${urlApi}/countries`;
    const result = await fetchJson(urlParams, requestOptions);
    return fixSelect(result);
  } catch (e) {
    return e;
  }
};

const getSummary = async () => {
  try {
    const requestOptions = {
      method: 'GET',
      redirect: 'follow',
    };

    const urlParams = `${urlApi}/summary`;
    const result = await fetchJson(urlParams, requestOptions);

    data = {
      totalConfirmados: result.Global.TotalConfirmed,
      totalMortes: result.Global.TotalDeaths,
      totalRecuperados: result.Global.TotalRecovered,
      atualizacao: result.Global.Date,
    };
    showTotal(data);
  } catch (e) {
    return e;
  }
};

/****
 * Helpers
 ****/

const addZero = (number) => {
  if (number <= 9) return '0' + number;
  return number;
};

const formatNumber = (num) => {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
};

const formatDate = (date, select = '-', order = 'Y') => {
  if ((order = 'Y')) {
    return (
      date.getFullYear() +
      select +
      addZero(date.getMonth() + 1) +
      select +
      addZero(date.getDate())
    );
  }
};

const fetchJson = async (urlParams, requestOptions) => {
  return await fetch(urlParams, requestOptions).then((response) =>
    response.json(),
  );
};
