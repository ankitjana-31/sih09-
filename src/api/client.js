/**
 * SIH-PS9-MOIL API Client
 * Built against FastAPI backend contract for MOIL Ltd. (Ministry of Steel)
 * SIH Problem Statement 26009
 * 
 * To switch to live FastAPI backend, set USE_MOCK_API = false.
 */

let _useMockApi = true;

export const USE_MOCK_API = true;

export function isUsingMockApi() {
  return _useMockApi;
}

export function setUseMockApi(val) {
  _useMockApi = !!val;
}

function shouldUseMock() {
  return _useMockApi;
}
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

let authToken = localStorage.getItem('moil_auth_token') || null;

export function setClientAuthToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem('moil_auth_token', token);
  } else {
    localStorage.removeItem('moil_auth_token');
  }
}

export function getClientAuthToken() {
  return authToken;
}

/**
 * Standard fetch wrapper attaching Bearer token and handling 401
 */
async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    setClientAuthToken(null);
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API Error ${response.status}: ${errorBody || response.statusText}`);
  }

  return response.json();
}

/* =========================================================================
   MOCK GENERATOR HELPERS (Deterministic per mineId / seed)
   ========================================================================= */

// Simple pseudo-random number generator for reproducible seed-based output
function createPRNG(seed) {
  let s = 0;
  for (let i = 0; i < seed.length; i++) {
    s = (s << 5) - s + seed.charCodeAt(i);
    s |= 0;
  }
  return function () {
    s = Math.imul(s ^ (s >>> 15), 1 | s);
    s = (s + Math.imul(s ^ (s >>> 7), 61 | s)) ^ s;
    return ((s >>> 0) / 4294967296);
  };
}

// Coordinate anchors for MOIL Manganese Mines
export const MOIL_MINES = [
  { id: 'balaghat', name: 'Balaghat Mine', sector: 'Central Sector - MP', state: 'Madhya Pradesh', lat: 21.8706, lng: 80.1967, type: 'Underground & Open Cast', strike: 'N62°E' },
  { id: 'dongri_buzurg', name: 'Dongri Buzurg Mine', sector: 'Western Sector - MH', state: 'Maharashtra', lat: 21.5500, lng: 79.6800, type: 'Open Cast Heavy Media', strike: 'N75°E' },
  { id: 'gumgaon', name: 'Gumgaon Mine', sector: 'Nagpur Sector - MH', state: 'Maharashtra', lat: 21.3850, lng: 78.9800, type: 'Underground Incline', strike: 'N55°E' },
  { id: 'ukwa', name: 'Ukwa Mine', sector: 'Balaghat Sector - MP', state: 'Madhya Pradesh', lat: 21.9600, lng: 80.4600, type: 'Underground Drift Adit', strike: 'N68°E' },
  { id: 'tirodi', name: 'Tirodi Operations', sector: 'Southern Sector - MP', state: 'Madhya Pradesh', lat: 21.6800, lng: 79.7200, type: 'Open Cast Benches', strike: 'N60°E' },
  { id: 'kandri', name: 'Kandri Mine', sector: 'Nagpur Sector - MH', state: 'Maharashtra', lat: 21.4100, lng: 79.2600, type: 'Underground', strike: 'N58°E' },
  { id: 'mansar', name: 'Mansar Mine', sector: 'Ramtek Sector - MH', state: 'Maharashtra', lat: 21.3900, lng: 79.2800, type: 'Underground & Open Cast', strike: 'N64°E' },
  { id: 'chikla', name: 'Chikla Mine', sector: 'Bhandara Sector - MH', state: 'Maharashtra', lat: 21.5600, lng: 79.7600, type: 'Underground', strike: 'N70°E' }
];

/* =========================================================================
   API CONTRACT IMPLEMENTATIONS
   ========================================================================= */

/**
 * 1. login(username, password)
 * POST /api/v1/auth/login
 * Response: { access_token, token_type }
 */
export async function login(username, password) {
  if (shouldUseMock()) {
    await new Promise((res) => setTimeout(res, 350));
    const mockToken = `sih_jwt_${btoa(username || 'planner')}_${Date.now()}`;
    setClientAuthToken(mockToken);
    return {
      access_token: mockToken,
      token_type: 'bearer',
      user: {
        username: username || 'ankit.jana',
        name: 'Ankit Jana',
        role: 'Sr. Mine Planner',
        division: 'Directorate of Mine Planning & Geosciences',
        sector: 'Manganese Belt Sector 04',
      }
    };
  }

  const data = await request('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setClientAuthToken(data.access_token);
  return data;
}

/**
 * 2. getReserveMap(mineId)
 * GET /api/v1/reserves/map/{mine_id}
 * Response: GeoJSON FeatureCollection;
 * properties = { cell_id, score (0-1), confidence (0-1), evidence_flag: "OK"|"LOW_EVIDENCE",
 * breakdown: { geological, spectral, structural, borehole, geophysical, environmental },
 * validation_status, model_version }
 */
export async function getReserveMap(mineId = 'balaghat') {
  if (shouldUseMock()) {
    await new Promise((res) => setTimeout(res, 200));
    const mine = MOIL_MINES.find((m) => m.id === mineId) || MOIL_MINES[0];
    const rand = createPRNG(mine.id);

    // Generate ~35-42 grid cells (5 rows x 7 cols) centered around the mine's lat/lng
    const cellSize = 0.0045; // roughly 500m grid cell
    const rows = 5;
    const cols = 7;
    const startRow = Math.floor(rows / 2);
    const startCol = Math.floor(cols / 2);

    const BALAGHAT_EXACT_GRID = [
      [
        { id: 'BG-671', score: 0.311, isSparse: false, conf: 0.54 },
        { id: 'BG-672', score: 0.220, isSparse: true, conf: 0.32 },
        { id: 'BG-673', score: 0.318, isSparse: false, conf: 0.58 },
        { id: 'BG-674', score: 0.887, isSparse: false, conf: 0.86 },
        { id: 'BG-675', score: 0.250, isSparse: true, conf: 0.31 },
        { id: 'BG-676', score: 0.193, isSparse: false, conf: 0.45 },
        { id: 'BG-677', score: 0.125, isSparse: false, conf: 0.39 },
      ],
      [
        { id: 'BG-686', score: 0.284, isSparse: false, conf: 0.52 },
        { id: 'BG-687', score: 0.693, isSparse: false, conf: 0.77 },
        { id: 'BG-688', score: 0.678, isSparse: false, conf: 0.76 },
        { id: 'BG-689', score: 0.795, isSparse: false, conf: 0.84 },
        { id: 'BG-690', score: 0.821, isSparse: false, conf: 0.85 },
        { id: 'BG-691', score: 0.813, isSparse: false, conf: 0.83 },
        { id: 'BG-692', score: 0.210, isSparse: true, conf: 0.34 },
      ],
      [
        { id: 'BG-701', score: 0.228, isSparse: false, conf: 0.49 },
        { id: 'BG-702', score: 0.540, isSparse: false, conf: 0.71 },
        { id: 'BG-703', score: 0.742, isSparse: false, conf: 0.81 },
        { id: 'BG-704', score: 0.914, isSparse: false, conf: 0.882, isApex: true },
        { id: 'BG-705', score: 0.821, isSparse: false, conf: 0.85 },
        { id: 'BG-706', score: 0.613, isSparse: false, conf: 0.74 },
        { id: 'BG-707', score: 0.349, isSparse: false, conf: 0.61 },
      ],
      [
        { id: 'BG-716', score: 0.272, isSparse: false, conf: 0.51 },
        { id: 'BG-717', score: 0.396, isSparse: false, conf: 0.63 },
        { id: 'BG-718', score: 0.683, isSparse: false, conf: 0.76 },
        { id: 'BG-719', score: 0.698, isSparse: false, conf: 0.87 },
        { id: 'BG-720', score: 0.598, isSparse: false, conf: 0.72 },
        { id: 'BG-721', score: 0.240, isSparse: true, conf: 0.33 },
        { id: 'BG-722', score: 0.218, isSparse: false, conf: 0.48 },
      ],
      [
        { id: 'BG-731', score: 0.214, isSparse: false, conf: 0.46 },
        { id: 'BG-732', score: 0.180, isSparse: false, conf: 0.42 },
        { id: 'BG-733', score: 0.275, isSparse: false, conf: 0.50 },
        { id: 'BG-734', score: 0.382, isSparse: false, conf: 0.62 },
        { id: 'BG-735', score: 0.241, isSparse: false, conf: 0.49 },
        { id: 'BG-736', score: 0.143, isSparse: false, conf: 0.38 },
        { id: 'BG-737', score: 0.190, isSparse: true, conf: 0.30 },
      ],
    ];

    const features = [];
    let maxScore = -1;
    let apexCellId = 'BG-704';
    const minePrefix = mine.id === 'balaghat' ? 'BG' : mine.id === 'gumgaon' ? 'GM' : mine.id === 'dongri_buzurg' ? 'DB' : 'UK';

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let cell_id;
        let rawScore;
        let isLowEvidence;
        let confidence;
        let isApex = false;

        if (mine.id === 'balaghat') {
          const item = BALAGHAT_EXACT_GRID[r][c];
          cell_id = item.id;
          rawScore = item.score;
          isLowEvidence = item.isSparse;
          confidence = item.conf;
          isApex = !!item.isApex;
        } else {
          const cellNumber = 671 + r * 15 + c;
          cell_id = `${minePrefix}-${cellNumber}`;
          const distFromCenter = Math.sqrt(Math.pow(r - 2, 2) + Math.pow(c - 3, 2));
          const strikeAlignment = Math.sin((r * 0.8 + c * 0.4) + rand());
          rawScore = Math.max(0.1, Math.min(0.96, 0.88 - distFromCenter * 0.18 + strikeAlignment * 0.15 + (rand() - 0.5) * 0.12));
          if (r === 2 && c === 3) {
            rawScore = 0.914;
            isApex = true;
          }
          isLowEvidence = (r === 0 && (c === 1 || c === 4)) || (r === 3 && c === 5) || (r === 4 && c === 6) || rand() < 0.18;
          confidence = isLowEvidence ? Number((0.25 + rand() * 0.2).toFixed(3)) : Number((0.78 + rand() * 0.18).toFixed(3));
        }

        const boreholeScore = isApex ? 0.898 : isLowEvidence ? 0 : Number((0.4 + rand() * 0.55).toFixed(3));
        const geophysicalScore = isApex ? 0.724 : isLowEvidence ? 0 : Number((0.35 + rand() * 0.6).toFixed(3));
        const geologicalScore = isApex ? 0.942 : Number((0.5 + rand() * 0.45).toFixed(3));
        const spectralScore = isApex ? 0.865 : Number((0.45 + rand() * 0.5).toFixed(3));
        const structuralScore = isApex ? 0.865 : Number((0.4 + rand() * 0.55).toFixed(3));
        const environmentalScore = Number((0.7 + rand() * 0.28).toFixed(3));
        const evidence_flag = isLowEvidence ? 'LOW_EVIDENCE' : 'OK';

        // Calculate polygon bounds (500m cell)
        const cellLat = mine.lat + (r - startRow) * cellSize;
        const cellLng = mine.lng + (c - startCol) * cellSize;

        const half = cellSize / 2;
        const polygonCoords = [
          [
            [cellLng - half, cellLat - half],
            [cellLng + half, cellLat - half],
            [cellLng + half, cellLat + half],
            [cellLng - half, cellLat + half],
            [cellLng - half, cellLat - half],
          ]
        ];

        if (rawScore > maxScore) {
          maxScore = rawScore;
          apexCellId = cell_id;
        }

        features.push({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: polygonCoords,
          },
          properties: {
            cell_id,
            score: Number(rawScore.toFixed(3)),
            confidence: Number(confidence.toFixed(3)),
            evidence_flag,
            breakdown: {
              geological: geologicalScore,
              spectral: spectralScore,
              structural: structuralScore,
              borehole: boreholeScore,
              geophysical: geophysicalScore,
              environmental: environmentalScore,
            },
            validation_status: isLowEvidence ? 'SPARSE' : 'EVIDENCED',
            model_version: 'v4.2.1-fused',
            center: [cellLat, cellLng],
            isApex: isApex || (r === 2 && c === 3),
            strike_azimuth: mine.strike,
            lithology: isLowEvidence ? 'Undifferentiated Biotite Schist' : 'Gondite-hosted Manganese Ore Intercept',
            drillhole_ref: isLowEvidence ? 'NONE (Unperforated)' : `DH-${minePrefix}-2024-${80 + (c % 15)}: 42.6% Mn @ 84mRL`
          },
        });
      }
    }

    return {
      type: 'FeatureCollection',
      features,
      metadata: {
        mine_id: mine.id,
        mine_name: mine.name,
        center: [mine.lat, mine.lng],
        apex_cell_id: apexCellId,
        model_version: 'XGB-Ensemble v4.2.1',
        data_as_of: '24 Oct, 04:20 IST',
        crs: 'EPSG:32644 (UTM 44N)',
        resolution: '500m x 500m Subsurface Block'
      }
    };
  }

  return request(`/api/v1/reserves/map/${mineId}`);
}

/**
 * 3. getProductionForecast(mineId)
 * GET /api/v1/production/forecast/{mine_id}
 * Response: { model_version, data_as_of, trend: [{ period, planned_tonnes, actual_tonnes, predicted_tonnes }] } (≈12 periods)
 */
export async function getProductionForecast(mineId = 'balaghat') {
  if (shouldUseMock()) {
    await new Promise((res) => setTimeout(res, 180));
    
    // 12 monthly periods: Nov 24 to Oct 25
    const periods = [
      { period: 'Nov 24', planned_tonnes: 45000, actual_tonnes: 44200, predicted_tonnes: null, isForecast: false },
      { period: 'Dec 24', planned_tonnes: 47000, actual_tonnes: 46800, predicted_tonnes: null, isForecast: false },
      { period: 'Jan 25', planned_tonnes: 48500, actual_tonnes: 48100, predicted_tonnes: null, isForecast: false },
      { period: 'Feb 25', planned_tonnes: 50000, actual_tonnes: 50200, predicted_tonnes: null, isForecast: false },
      { period: 'Mar 25', planned_tonnes: 52000, actual_tonnes: 51800, predicted_tonnes: null, isForecast: false },
      { period: 'Apr 25', planned_tonnes: 51000, actual_tonnes: 50400, predicted_tonnes: null, isForecast: false },
      { period: 'May 25', planned_tonnes: 49500, actual_tonnes: 48900, predicted_tonnes: null, isForecast: false },
      { period: 'Jun 25', planned_tonnes: 46000, actual_tonnes: 44300, predicted_tonnes: null, isForecast: false },
      { period: 'Jul 25', planned_tonnes: 44000, actual_tonnes: 32500, predicted_tonnes: null, isForecast: false, anomaly: 'Monsoon Surge (+140mm rainfall)' },
      { period: 'Aug 25', planned_tonnes: 46000, actual_tonnes: 42100, predicted_tonnes: null, isForecast: false },
      { period: 'Sep 25', planned_tonnes: 48000, actual_tonnes: 45200, predicted_tonnes: 45800, isForecast: false },
      { period: 'Oct 25', planned_tonnes: 52000, actual_tonnes: null, predicted_tonnes: 46350, isForecast: true, ci_low: 45100, ci_high: 47600 }
    ];

    return {
      model_version: 'Production-LSTM v2.8',
      data_as_of: '24 Oct, 06:00 IST',
      stats: {
        planned_total: 584200,
        actual_to_date: 492180,
        lstm_forecast_2mo: 77770,
        total_net_deficit: -14250,
        mae_percent: 2.4,
        r2_correlation: 0.932,
        training_loss: 0.014,
        epochs: 200,
        confidence_interval: '90% CI: [151,200 MT - 159,800 MT]'
      },
      trend: periods,
    };
  }

  return request(`/api/v1/production/forecast/${mineId}`);
}

/**
 * 4. getRiskTier(mineId)
 * GET /api/v1/risk/{mine_id}
 * Response: { risk_tier: "LOW"|"MEDIUM"|"HIGH"|"CRITICAL", top_factors: [{ factor, pct_contribution, est_loss_tonnes }], model_version, data_as_of }
 */
export async function getRiskTier(mineId = 'balaghat') {
  if (shouldUseMock()) {
    await new Promise((res) => setTimeout(res, 150));

    return {
      risk_tier: 'MEDIUM',
      risk_score_pct: 8.4,
      model_version: 'Shortfall-Net v3.1',
      data_as_of: '24 Oct, 06:00 IST',
      deficit_mt: -14250,
      deficit_pct: -8.4,
      monthly_plan_tonnes: 170000,
      predicted_fulfillment_tonnes: 155750,
      fulfillment_pct: 91.6,
      narrative: 'Balaghat Sector 04 faces a probable 8.4% production shortfall over the next 30 days driven primarily by mechanical uncoupling and pit water accumulation.',
      top_factors: [
        {
          id: 'factor-1',
          factor: 'Equipment Downtime',
          description: 'Excavator EX-04 transmission overhaul + Dumper haulage lag',
          pct_contribution: 38.5,
          est_loss_tonnes: 5480,
          severity: 'CRITICAL',
          color: '#C24E4E'
        },
        {
          id: 'factor-2',
          factor: 'Pit Dewatering & Rainfall',
          description: 'Bench 14 sump overflow following seasonal run-off saturation',
          pct_contribution: 26.2,
          est_loss_tonnes: 3730,
          severity: 'HIGH',
          color: '#D97F3D'
        },
        {
          id: 'factor-3',
          factor: 'Blasting & Fragmentation Delay',
          description: 'DGMS explosive magazine clearance compliance bottleneck',
          pct_contribution: 19.4,
          est_loss_tonnes: 2760,
          severity: 'MEDIUM',
          color: '#D1A438'
        },
        {
          id: 'factor-4',
          factor: 'Ore Accessibility & Stripping',
          description: 'Overburden stripping ratio shift in Hanging Wall Block B',
          pct_contribution: 15.9,
          est_loss_tonnes: 2280,
          severity: 'LOW',
          color: '#4C9A6A'
        }
      ]
    };
  }

  return request(`/api/v1/risk/${mineId}`);
}

/**
 * 5. getRecommendations(mineId)
 * GET /api/v1/recommendations/{mine_id}
 * Response: [{ id, action_text, priority, predicted_recovery_tonnes, approval_status: "pending"|"approved"|"rejected", cause_factor, cause_pct, ... }]
 */
export async function getRecommendations(mineId = 'balaghat') {
  if (shouldUseMock()) {
    await new Promise((res) => setTimeout(res, 200));

    // Stored in memory or local storage for persistent approval interactions
    const savedApprovals = JSON.parse(localStorage.getItem('moil_recommendation_approvals') || '{}');

    const baseRecs = [
      {
        id: 'PR-01',
        action_text: 'Reroute Excavator EX-02 to Bench 12 Ore Face & Deploy Contract Dumper Fleet',
        priority: 'URGENT',
        category: 'Urgent',
        seq: '001/05',
        predicted_recovery_tonnes: 6200,
        approval_status: savedApprovals['PR-01'] || 'pending',
        cause_factor: 'Equipment Downtime & Haulage Lag',
        cause_pct: 38.5,
        deficit_restoration_pct: 43.5,
        execution_lead_time: '18 Hours (Shift-2)',
        dispatch_staging: 'Ramp 4',
        est_cost_lakhs: 4.8,
        cost_breakdown: 'Diesel + 4x 35T Dumper lease',
        geotechnical_fs: 1.42,
        geotechnical_status: 'Geotechnical Stability Model Validated (FS: 1.42)',
        notes: 'Enables high-grade manganese face access at +84mRL horizon without blasting interruption.'
      },
      {
        id: 'PR-02',
        action_text: 'Commission 2x 150HP High-Head Submersible Pumps at Pit 3 Bench 14',
        priority: 'HIGH IMPACT',
        category: 'High Impact',
        seq: '002/05',
        predicted_recovery_tonnes: 4100,
        approval_status: savedApprovals['PR-02'] || 'approved',
        cause_factor: 'Pit Dewatering & Inundation',
        cause_pct: 26.2,
        deficit_restoration_pct: 28.7,
        execution_lead_time: '12 Hours',
        dispatch_staging: 'Pit 3 Sump B',
        est_cost_lakhs: 2.4,
        cost_breakdown: 'Power: 33kV Line ready + cable reel',
        water_level_reduction: '-1.8m in 48 Hours',
        power_infrastructure: '33kV Feeder Active (+220 kW)',
        discharge_metrics: '3,400 m³/hr Sump B (Pollution Board Compliant)',
        approved_by: 'Dr. A. Sharma at 05:30 IST',
        dispatch_id: '#WO-BAL-8821'
      },
      {
        id: 'PR-03',
        action_text: 'Execute Controlled Secondary Blasting via Electronic Detonators',
        priority: 'OPERATIONAL',
        category: 'High Impact',
        seq: '003/05',
        predicted_recovery_tonnes: 2800,
        approval_status: savedApprovals['PR-03'] || 'pending',
        cause_factor: 'Fragmentation Delay to Primary Crusher',
        cause_pct: 19.4,
        deficit_restoration_pct: 19.6,
        execution_lead_time: '24 Hours',
        dispatch_staging: 'Pit 2 Hanging Wall',
        est_cost_lakhs: 1.8,
        cost_breakdown: 'Electronic detonators + blasting crew',
        crusher_throughput: '+14% Feed Velocity',
        oversize_boulders: 'Oversize boulders >600mm halved',
        regulatory_clearance: 'DGMS Rule 106 Vibration: <5mm/s PPV cleared',
        detonation_window: '13:30 - 14:15 IST (Shift exchange buffer)',
        regulatory_warning: 'Night blasting restricted; must execute within daylight window.'
      },
      {
        id: 'PR-04',
        action_text: 'Third Shift Maintenance Overtime & Belt Splicing Conveyor CV-04',
        priority: 'MAINTENANCE',
        category: 'Maint',
        seq: '004/05',
        predicted_recovery_tonnes: 1900,
        approval_status: savedApprovals['PR-04'] || 'pending',
        cause_factor: 'Ore Handling & Conveyor Roller Slippage',
        cause_pct: 15.9,
        deficit_restoration_pct: 13.3,
        execution_lead_time: '8 Hours (Overnight)',
        dispatch_staging: 'Central Transfer Tower',
        est_cost_lakhs: 2.2,
        cost_breakdown: 'Tier 2 overtime + vulcanizing kit',
        preventative_note: 'Expedites preventative belt tension recalibration to prevent sudden midnight line stoppage.',
        resource_clash: 'Night maintenance crew available (Tier 2 overtime approved)'
      },
      {
        id: 'PR-05',
        action_text: 'Temporary Haul Road Bypass via Switchback 3 Incline Re-grading',
        priority: 'OPERATIONAL',
        category: 'Maint',
        seq: '005/05',
        predicted_recovery_tonnes: 1400,
        approval_status: savedApprovals['PR-05'] || 'pending',
        cause_factor: 'Dumper Cycle Latency (+11 min)',
        cause_pct: 12.0,
        deficit_restoration_pct: 9.8,
        execution_lead_time: '14 Hours',
        dispatch_staging: 'Switchback 3 Ramp',
        est_cost_lakhs: 1.1,
        cost_breakdown: 'Grader + water sprinkler deployment',
        preventative_note: 'Reduces heavy 35T dumper cycle time by 4.2 minutes per haul cycle.'
      }
    ];

    const result = [...baseRecs];
    result.recommendations = baseRecs;
    result.count = baseRecs.length;
    result.model_version = 'Mitigation-Net v3.1';
    result.data_as_of = '24 Oct, 06:00 IST';
    return result;
  }

  return request(`/api/v1/recommendations/${mineId}`);
}

/**
 * 6. approveRecommendation(id, status)
 * POST /api/v1/recommendations/{id}/approve
 * Response: { id, approval_status }
 */
export async function approveRecommendation(id, status) {
  if (shouldUseMock()) {
    await new Promise((res) => setTimeout(res, 180));
    const savedApprovals = JSON.parse(localStorage.getItem('moil_recommendation_approvals') || '{}');
    savedApprovals[id] = status;
    localStorage.setItem('moil_recommendation_approvals', JSON.stringify(savedApprovals));
    return {
      id,
      approval_status: status,
      timestamp: new Date().toISOString(),
      authorized_by: 'Dr. A. Sharma (Sr. Mine Planner)',
      message: `Recommendation ${id} successfully set to ${status.toUpperCase()}`
    };
  }

  return request(`/api/v1/recommendations/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
}

/**
 * 7. simulateScenario(mineId, actions)
 * POST /api/v1/recommendations/simulate
 * Response: { scenario_id, actions, predicted_recovery_tonnes, feasibility: "feasible"|"blocked" }
 * Note: predicted_recovery_tonnes must never exceed base_shortfall * 1.05
 */
export async function simulateScenario(mineId = 'balaghat', actionIds = ['PR-01', 'PR-02']) {
  const baseShortfall = 14250;
  const maxAllowed = baseShortfall * 1.05; // 14962.5 MT

  if (shouldUseMock()) {
    await new Promise((res) => setTimeout(res, 220));

    const actionTonnages = {
      'PR-01': 6200,
      'PR-02': 4100,
      'PR-03': 2800,
      'PR-04': 1900,
      'PR-05': 1400,
    };

    let rawRecovery = actionIds.reduce((sum, id) => sum + (actionTonnages[id] || 0), 0);
    // Hard constraint: a scenario can never invent more recovered tonnage than the shortfall itself explains (+5% tolerance)
    const cappedRecovery = Math.min(rawRecovery, maxAllowed);

    // Rule engine for feasibility:
    // If PR-03 is selected alone without daylight clearance window or with conflicting nighttime blasting, it triggers a warning or block
    let feasibility = 'feasible';
    let blockReason = null;

    if (actionIds.includes('PR-03') && actionIds.includes('PR-04')) {
      // Both secondary blasting and nighttime maintenance overlap constraint
      feasibility = 'blocked';
      blockReason = 'DGMS nighttime blasting restriction conflicts with CV-04 belt maintenance window.';
    }

    const netResidual = -(baseShortfall - cappedRecovery);
    const capexLakhs = actionIds.length === 0 ? 0 : actionIds.length === 1 ? 4.8 : actionIds.length === 2 ? 7.2 : 9.6;
    const netValueRecoveredLakhs = Number((cappedRecovery * 0.0082).toFixed(1)); // Approx ₹820 per tonne net value
    const roi = capexLakhs > 0 ? (netValueRecoveredLakhs / capexLakhs).toFixed(1) : '0.0';

    return {
      scenario_id: `SCEN-${Date.now().toString(36).toUpperCase()}`,
      actions: actionIds,
      predicted_recovery_tonnes: cappedRecovery,
      feasibility,
      block_reason: blockReason,
      base_shortfall_tonnes: baseShortfall,
      net_residual_tonnes: netResidual > 0 ? 0 : netResidual,
      mitigation_pct: Number(((cappedRecovery / baseShortfall) * 100).toFixed(1)),
      est_capex_lakhs: capexLakhs,
      net_value_lakhs: netValueRecoveredLakhs,
      roi_multiplier: `${roi}x`,
      model_version: 'Sim-MonteCarlo v2.1 Engine',
      latency_ms: 120
    };
  }

  return request('/api/v1/recommendations/simulate', {
    method: 'POST',
    body: JSON.stringify({ mine_id: mineId, actions: actionIds }),
  });
}
