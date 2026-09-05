import { useState } from 'react'
import './App.css'

const residents = [
  'Anwar Bangash',
  'Momtaz Ud Din',
  'Junaid Ahmad',
  'Museeb Ahmad',
  'Liaqat Haji',
]

const roomNames = [
  'Anwar Bangash Room',
  'Momtaz Ud Din Room',
  'Junaid Ahmad Room',
  'Museeb Ahmad Room',
  'Liaqat Haji Room',
]

type AddedExpense = { name: string; amount: number }

function App() {
  const [electricityBill, setElectricityBill] = useState('')
  const [waterBill, setWaterBill] = useState('')
  const [wifiBill, setWifiBill] = useState('')
  const [expenseName, setExpenseName] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [addedExpenses, setAddedExpenses] = useState<AddedExpense[]>([])
  const [roomPeople, setRoomPeople] = useState<string[]>(() => roomNames.map(() => ''))
  const billAmount = Number(electricityBill) || 0
  const waterAmount = Number(waterBill) || 0
  const wifiAmount = Number(wifiBill) || 0
  const overallTotal = billAmount + waterAmount + wifiAmount
  const individualShare = billAmount / residents.length
  const addedExpenseTotal = addedExpenses.reduce((total, expense) => total + expense.amount, 0)
  const sharedMonthlyTotal = waterAmount + wifiAmount + addedExpenseTotal
  const totalPeople = roomPeople.reduce((total, people) => total + (Number(people) || 0), 0)
  const allRoomsFilled = roomPeople.every((people) => people.trim() !== '' && Number(people) > 0)
  const totalPersonDays = totalPeople * 30
  const dailyPerPerson = allRoomsFilled ? sharedMonthlyTotal / totalPersonDays : 0
  const monthlyPerPerson = allRoomsFilled ? dailyPerPerson * 30 : 0

  const updateRoomPeople = (index: number, value: string) => {
    setRoomPeople((people) => people.map((current, currentIndex) => currentIndex === index ? value : current))
  }

  const addExpense = () => {
    const name = expenseName.trim()
    const amount = Number(expenseAmount)
    if (!name || !expenseAmount || amount < 0) return
    setAddedExpenses((expenses) => [...expenses, { name, amount }])
    setExpenseName('')
    setExpenseAmount('')
  }

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

          <label htmlFor="water-bill">Water</label>
          <div className="input-wrap">
            <span className="currency" aria-hidden="true">QAR</span>
            <input
              id="water-bill"
              name="water"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="Water amount"
              value={waterBill}
              onChange={(event) => setWaterBill(event.target.value)}
            />
          </div>

          <label htmlFor="wifi-bill">Wifi</label>
          <div className="input-wrap">
            <span className="currency" aria-hidden="true">QAR</span>
            <input
              id="wifi-bill"
              name="wifi"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="Wifi amount"
              value={wifiBill}
              onChange={(event) => setWifiBill(event.target.value)}
            />
          </div>

          <details className="room-bills">
            <summary>Room totals</summary>
            <div className="room-bill-list">
              {roomNames.map((roomName, index) => (
                <div className="room-bill" key={roomName}>
                  <span>{roomName}</span>
                  <input
                    id={`room-${index}`}
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    placeholder="Total person"
                    value={roomPeople[index]}
                    onChange={(event) => updateRoomPeople(index, event.target.value)}
                  />
                  <span className="room-share-value">
                    <small>Monthly per room</small>
                    {allRoomsFilled ? `QAR ${formatAmount((Number(roomPeople[index]) || 0) * monthlyPerPerson)}` : 'Fill all rooms'}
                  </span>
                  <span className="room-share-value">
                    <small>Daily per person</small>
                    {allRoomsFilled ? `QAR ${formatAmount(dailyPerPerson)}` : 'Fill all rooms'}
                  </span>
                </div>
              ))}
            </div>
            <div className="room-share-counts">
              <span>Total room people <strong>{totalPeople}</strong></span>
              <span>Total person-days <strong>{totalPersonDays}</strong></span>
            </div>
          </details>

          <details className="add-expense">
            <summary aria-label="Show fields to add an expense">
              <span className="plus-icon" aria-hidden="true">+</span>
              <span>Add expense</span>
            </summary>
            <div className="add-expense-fields">
              <div>
                <label htmlFor="expense-name">Name</label>
                <input
                  id="expense-name"
                  name="expenseName"
                  type="text"
                  placeholder="Name"
                  value={expenseName}
                  onChange={(event) => setExpenseName(event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="expense-amount">Amount</label>
                <input
                  id="expense-amount"
                  name="expenseAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="Amount"
                  value={expenseAmount}
                  onChange={(event) => setExpenseAmount(event.target.value)}
                />
              </div>
              <button type="button" className="add-button" onClick={addExpense}>Add</button>
            </div>
          </details>
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

        {(electricityBill || waterBill || wifiBill || addedExpenses.length > 0) && (
          <section className="bill-summary" aria-label="Bill totals">
            {electricityBill && (
              <div className="summary-item">
                <span>Electricity Bill</span>
                <strong>QAR {formatAmount(billAmount)}</strong>
              </div>
            )}
            {waterBill && (
              <div className="summary-item">
                <span>Water</span>
                <strong>QAR {formatAmount(waterAmount)}</strong>
              </div>
            )}
            {wifiBill && (
              <div className="summary-item">
                <span>Wifi</span>
                <strong>QAR {formatAmount(wifiAmount)}</strong>
              </div>
            )}
            {addedExpenses.map((expense, index) => (
              <div className="summary-item added-summary" key={`${expense.name}-${expense.amount}-${index}`}>
                <span>{expense.name}</span>
                <strong>QAR {formatAmount(expense.amount)}</strong>
              </div>
            ))}
            {(electricityBill || waterBill || wifiBill) && (
              <div className="summary-item overall-total">
                <span>Overall Total</span>
                <strong>QAR {formatAmount(overallTotal)}</strong>
              </div>
            )}
          </section>
        )}

      </section>
    </main>
  )
}

export default App
