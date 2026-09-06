import { useState } from 'react'
import { Download, Plus, Users } from 'lucide-react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
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
  const individualShare = billAmount / residents.length
  const addedExpenseTotal = addedExpenses.reduce((total, expense) => total + expense.amount, 0)
  const overallTotal = billAmount + waterAmount + wifiAmount + addedExpenseTotal
  const sharedMonthlyTotal = waterAmount + wifiAmount + addedExpenseTotal
  const totalPeople = roomPeople.reduce((total, people) => total + (Number(people) || 0), 0)
  const allRoomsFilled = roomPeople.every((people) => people.trim() !== '' && Number(people) > 0)
  const totalPersonDays = totalPeople * 31
  const dailyPerPerson = allRoomsFilled ? sharedMonthlyTotal / totalPersonDays : 0
  const monthlyPerPerson = allRoomsFilled ? dailyPerPerson * 31 : 0

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

  const downloadPdf = () => {
    const document = new jsPDF({ orientation: 'landscape' })
    const tableBody = residents.map((resident, index) => {
      const roomPeopleCount = Number(roomPeople[index]) || 0
      const monthlyRoom = allRoomsFilled ? roomPeopleCount * monthlyPerPerson : 0
      const finalRoom = individualShare + monthlyRoom

      return [
        resident,
        `QAR ${formatAmount(individualShare)}`,
        allRoomsFilled ? `QAR ${formatAmount(dailyPerPerson)}` : 'Fill all rooms',
        allRoomsFilled ? `QAR ${formatAmount(monthlyRoom)}` : 'Fill all rooms',
        allRoomsFilled ? `QAR ${formatAmount(monthlyPerPerson)}` : 'Fill all rooms',
        allRoomsFilled ? `QAR ${formatAmount(finalRoom)}` : 'Fill all rooms',
      ]
    })

    document.setFontSize(18)
    document.text('Qatar Rent | Monthly Results', 14, 18)
    document.setFontSize(9)
    document.setTextColor(105, 113, 108)
    document.text(`Generated ${new Date().toLocaleDateString('en-GB')}`, 14, 25)
    const billSummary = [
      ['Electricity Bill', `QAR ${formatAmount(billAmount)}`],
      ['Water', `QAR ${formatAmount(waterAmount)}`],
      ['Wifi', `QAR ${formatAmount(wifiAmount)}`],
      ...addedExpenses.map((expense) => [expense.name, `QAR ${formatAmount(expense.amount)}`]),
      ['Overall Total', `QAR ${formatAmount(overallTotal)}`],
    ]
    autoTable(document, {
      startY: 30,
      head: [['Bill totals', 'Amount']],
      body: billSummary,
      theme: 'grid',
      headStyles: { fillColor: [30, 39, 35], textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: { 1: { halign: 'right' } },
    })
    autoTable(document, {
      startY: 30 + (billSummary.length + 1) * 9 + 10,
      head: [['Name', 'Electricity Bill', 'Daily / person', 'Monthly / room', 'Monthly / person', 'Final / room']],
      body: tableBody,
      foot: [['Total', `QAR ${formatAmount(billAmount)}`, '', '', '', `QAR ${formatAmount(overallTotal)}`]],
      theme: 'grid',
      headStyles: { fillColor: [30, 39, 35], textColor: [255, 255, 255] },
      footStyles: { fillColor: [219, 90, 61], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 4 },
    })
    document.save('qatar-rent-monthly-results.pdf')
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-mark" aria-hidden="true">QR</div>
        <div>
          <p className="eyebrow">Household ledger</p>
          <h1>Monthly rent split</h1>
        </div>
        <div className="header-meta">
          <span className="status-dot" aria-hidden="true" />
          <span>Ready to calculate</span>
        </div>
      </header>

      <div className="workspace">
      <section className="bill-panel panel" aria-labelledby="bill-heading">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Monthly calculation</p>
            <h2 id="bill-heading">Enter your bills</h2>
          </div>
          <span className="panel-tag"><Users size={14} /> {residents.length} residents</span>
        </div>

        <form className="bill-form" onSubmit={(event) => event.preventDefault()}>
          <div className="bill-input-grid">
            <div className="bill-field">
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
                  placeholder=""
                  value={electricityBill}
                  onChange={(event) => setElectricityBill(event.target.value)}
                />
              </div>
            </div>

            <div className="bill-field">
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
            </div>

            <div className="bill-field">
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
            </div>
          </div>

          <details className="room-bills">
            <summary>
              <span>Room totals</span>
              <small>People and shared costs</small>
            </summary>
            <div className="room-bill-head" aria-hidden="true">
              <span>Room</span>
              <span>People</span>
              <span>Monthly / person</span>
              <span>Monthly / room</span>
              <span>Daily / person</span>
            </div>
            <div className="room-bill-list">
              {roomNames.map((roomName, index) => (
                <div className="room-bill" key={roomName}>
                  <span className="room-name">{roomName}</span>
                  <input
                    className="people-input"
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
                    <small>Monthly per person</small>
                    {allRoomsFilled ? `QAR ${formatAmount(monthlyPerPerson)}` : 'Fill all rooms'}
                  </span>
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
              <button type="button" className="add-button" onClick={addExpense}><Plus size={15} /> Add expense</button>
            </div>
          </details>
        </form>
      </section>

      <section className="results panel" aria-labelledby="results-heading">
        <div className="results-heading">
          <div>
            <p className="eyebrow">Live breakdown</p>
            <h2 id="results-heading">Each person pays</h2>
          </div>
          <button className="icon-button" type="button" onClick={downloadPdf} title="Download results as PDF" aria-label="Download results as PDF">
            <Download size={18} />
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Electricity Bill</th>
                <th scope="col">Daily per person</th>
                <th scope="col">Monthly per room</th>
                <th scope="col">Monthly per person</th>
                <th scope="col">Final per room</th>
              </tr>
            </thead>
            <tbody>
              {residents.map((resident, index) => (
                <tr key={resident}>
                  <td><span className="row-number">0{index + 1}</span>{resident}</td>
                  <td>QAR {formatAmount(individualShare)}</td>
                  <td>{allRoomsFilled ? `QAR ${formatAmount(dailyPerPerson)}` : 'Fill all rooms'}</td>
                  <td>{allRoomsFilled ? `QAR ${formatAmount((Number(roomPeople[index]) || 0) * monthlyPerPerson)}` : 'Fill all rooms'}</td>
                  <td>{allRoomsFilled ? `QAR ${formatAmount(monthlyPerPerson)}` : 'Fill all rooms'}</td>
                  <td>{allRoomsFilled ? `QAR ${formatAmount(individualShare + ((Number(roomPeople[index]) || 0) * monthlyPerPerson))}` : 'Fill all rooms'}</td>
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
      </div>
    </main>
  )
}

export default App
