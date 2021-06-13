
import './App.css';
import { Card, CardContent, FormControl, MenuItem, Select } from '@material-ui/core';
import { useEffect, useState } from 'react';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import { prettyPrintStat, sortData } from './util';
import LineGraph from './LineGraph';
import { MapContainer } from 'react-leaflet';
import "leaflet/dist/leaflet.css";






function App() {

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 36, lng: 414 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    if (countryCode === undefined) return;
    setCountry(countryCode);

    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then(response => response.json())
      .then(data => {
        setCountry(countryCode);
        setCountryInfo(data);

        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);

      })
  }



  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then(response => response.json())
      .then(data => {
        setCountryInfo(data);
      })
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then(response => response.json())
        .then(data => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2
          }));

          setMapCountries(data);
          setTableData(sortData(data));
          setCountries(countries);
        });
    }
    getCountriesData();
  }, []);




  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>React Project</h1>
          <FormControl className="app__dropdown" >
            <Select
              onChange={onCountryChange}
              varient="outlined"
              value={country}
            >
              <MenuItem value="worldwide">worldwide</MenuItem>
              {
                countries.map((country, index) => (
                  <MenuItem key={index} value={country.value}>{country.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox
            onClick={(e) => setCasesType('cases')}
            title="Coronavirus Cases"
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={prettyPrintStat(countryInfo.cases)} />
          <InfoBox
            onClick={(e) => setCasesType('recovered')}            
            title="Recovered"
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={prettyPrintStat(countryInfo.recovered)} />
          <InfoBox
            onClick={(e) => setCasesType('deaths')}
            title="Deaths"
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={prettyPrintStat(countryInfo.deaths)} />
        </div>

        <Map
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />

      </div>

      <Card className="app__right">
        <CardContent>
          <h3>Live Cases By Country</h3>
          <Table countries={tableData} />
          <h3>WorldWide New Cases</h3>
          <LineGraph />
        </CardContent>
      </Card>

    </div>
  );
}

export default App;
