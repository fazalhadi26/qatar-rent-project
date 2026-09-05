import { useState } from 'react'
import './App.css'

const residents = [
  'Anwar Bangash',
  'Momtaz Ud Din',
  'Junaid Ahmad',
  'Museeb Ahmad',
  'Liaqat Haji',
]

function App() {
  const [electricityBill, setElectricityBill] = useState('')
  const billAmount = Number(electricityBill) || 0
  const individualShare = billAmount / residents.length

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-QA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)

  return (
    <main className="app-shell">
      <section className="intro">
        <p className="eyebrow">Shared home expenses</p>
        <h1>Electricity, evenly shared.</h1>
        <p className="subtitle">
          Enter this month&apos;s bill to see each resident&apos;s equal share.
        </p>
      </section>

      <section className="bill-panel" aria-labelledby="bill-heading">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Monthly calculation</p>
            <h2 id="bill-heading">Electricity Bill</h2>
          </div>
          <span className="resident-count">{residents.length} residents</span>
        </div>

        <form className="bill-form" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="electricity-bill">Electricity Bill</label>
          <div className="input-wrap">
            <span className="currency" aria-hidden="true">QAR</span>
            <input
              id="electricity-bill"
              name="electricityBill"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="1500"
              value={electricityBill}
              onChange={(event) => setElectricityBill(event.target.value)}
              aria-describedby="bill-hint"
            />
          </div>
          <p className="input-hint" id="bill-hint">Enter any amount, for example 1500.</p>
        </form>
      </section>

      <section className="results" aria-labelledby="results-heading">
        <div className="results-heading">
          <div>
            <p className="eyebrow">The split</p>
            <h2 id="results-heading">Each person pays</h2>
          </div>
          <strong className="share-total">QAR {formatAmount(individualShare)}</strong>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Electricity Bill</th>
              </tr>
            </thead>
            <tbody>
              {residents.map((resident, index) => (
                <tr key={resident}>
                  <td><span className="row-number">0{index + 1}</span>{resident}</td>
                  <td>QAR {formatAmount(individualShare)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="total-line">Total bill <strong>QAR {formatAmount(billAmount)}</strong></p>
      </section>
    </main>
  )
}

export default App
