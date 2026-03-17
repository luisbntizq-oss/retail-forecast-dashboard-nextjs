const http = require('http');

const req = http.request('http://127.0.0.1:8000/predict', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'dev_api_key_12345'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    try {
      console.log('DATA:', JSON.stringify(JSON.parse(data), null, 2));
    } catch {
      console.log('RAW DATA:', data);
    }
  });
});

req.on('error', console.error);

req.write(JSON.stringify({
  variant_id: 1,
  start_date: "2024-01-01",
  end_date: "2024-02-01",
  periods: 30,
  lead_time_days: 15,
  current_stock: 0,
  service_level: 0.95,
  outlier_treatment: 'cap',
  outlier_sensitivity: 2.5,
  test_mode: false,
  weekly_seasonality: 10.0,
  yearly_seasonality: 0.0,
  seasonality_prior_scale: 10.0,
  changepoint_prior_scale: 0.05
}));
req.end();
