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

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const billAmount = Number(electricityBill) || 0
  const waterAmount = Number(waterBill) || 0
  const wifiAmount = Number(wifiBill) || 0
  const individualShare = billAmount / residents.length
  const addedExpenseTotal = addedExpenses.reduce((total, expense) => total + expense.amount, 0)
  const overallTotal = billAmount + waterAmount + wifiAmount + addedExpenseTotal
  const sharedMonthlyTotal = waterAmount + wifiAmount + addedExpenseTotal
  const totalPeople = roomPeople.reduce((total, people) => total + (Number(people) || 0), 0)
  const allRoomsFilled = roomPeople.every((people) => people.trim() !== '' && Number(people) > 0)
  const daysInSelectedMonth = new Date(new Date().getFullYear(), selectedMonth + 1, 0).getDate()
  const totalPersonDays = totalPeople * daysInSelectedMonth
  const dailyPerPerson = allRoomsFilled ? sharedMonthlyTotal / totalPersonDays : 0
  const monthlyPerPerson = allRoomsFilled ? dailyPerPerson * daysInSelectedMonth : 0

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
    const pageWidth = document.internal.pageSize.getWidth()
    const tableBody = residents.map((resident, index) => {
      const roomPeopleCount = Number(roomPeople[index]) || 0
      const monthlyRoom = allRoomsFilled ? roomPeopleCount * monthlyPerPerson : 0
      const finalRoom = individualShare + monthlyRoom

      return [
        resident,
        `QAR ${formatAmount(individualShare)}`,
        String(roomPeopleCount),
        allRoomsFilled ? `QAR ${formatAmount(dailyPerPerson)}` : 'QAR 0.00',
        allRoomsFilled ? `QAR ${formatAmount(monthlyPerPerson)}` : 'QAR 0.00',
        allRoomsFilled ? `QAR ${formatAmount(monthlyRoom)}` : 'QAR 0.00',
        allRoomsFilled ? `QAR ${formatAmount(finalRoom)}` : 'QAR 0.00',
      ]
    })

    document.setFillColor(255, 255, 255)
    document.rect(0, 0, pageWidth, 40, 'F')
    document.setDrawColor(17, 17, 17)
    document.setLineWidth(0.7)
    document.line(14, 36, pageWidth - 14, 36)
    document.setFillColor(17, 17, 17)
    document.roundedRect(14, 9, 24, 22, 2, 2, 'F')
    document.setTextColor(255, 255, 255)
    document.setFontSize(13)
    document.setFont('helvetica', 'bold')
    document.text('QR', 20, 23)
    document.setTextColor(17, 17, 17)
    document.setFontSize(17)
    document.text('MONTHLY EXPENSE STATEMENT', 45, 17)
    document.setFontSize(8)
    document.setFont('helvetica', 'normal')
    document.setTextColor(105, 113, 108)
    document.text('Electricity / Water / Wi-Fi split', 45, 26)
    document.setFontSize(8)
    document.setFont('helvetica', 'bold')
    document.setTextColor(17, 17, 17)
    document.text('CREATED BY SYED FAZAL', pageWidth - 14, 16, { align: 'right' })
    document.setFont('helvetica', 'normal')
    document.setTextColor(105, 113, 108)
    document.text(new Date().toLocaleDateString('en-GB'), pageWidth - 14, 26, { align: 'right' })

    const expenseRows = [
      ['Electricity Bill', `QAR ${formatAmount(billAmount)}`],
      ['Water', `QAR ${formatAmount(waterAmount)}`],
      ['Wi-Fi', `QAR ${formatAmount(wifiAmount)}`],
      ...addedExpenses.map((expense) => [expense.name, `QAR ${formatAmount(expense.amount)}`]),
      ['Overall Total', `QAR ${formatAmount(overallTotal)}`],
    ]
    const tableStartY = 50 + (expenseRows.length + 1) * 9 + 8
    autoTable(document, {
      startY: 50,
      head: [['EXPENSE', 'AMOUNT']],
      body: expenseRows,
      theme: 'grid',
      headStyles: { fillColor: [17, 17, 17], textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: { 1: { halign: 'right' } },
    })
    autoTable(document, {
      startY: tableStartY,
      head: [['Name', 'Electricity Bill', 'Total Person', 'Daily / person', 'Monthly / person', 'Monthly / room', 'Final / room']],
      body: tableBody,
      foot: [['Total', `QAR ${formatAmount(billAmount)}`, String(totalPeople), '', '', '', `QAR ${formatAmount(overallTotal)}`]],
      theme: 'grid',
      headStyles: { fillColor: [17, 17, 17], textColor: [255, 255, 255] },
      footStyles: { fillColor: [17, 17, 17], textColor: [255, 255, 255], fontStyle: 'bold' },
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
          <label className="month-selector" htmlFor="selected-month">
            <span className="sr-only">Select month</span>
            <select
              id="selected-month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(Number(event.target.value))}
            >
              {monthNames.map((month, index) => {
                const days = new Date(new Date().getFullYear(), index + 1, 0).getDate()
                return <option value={index} key={month}>{month} ({days} days)</option>
              })}
            </select>
          </label>
        </div>
      </header>

      <div className="workspace">
      <section className="bill-panel panel" aria-labelledby="bill-heading">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Monthly calculation</p>
            <h2 id="bill-heading">Enter your bills</h2>
          </div>
          <span className="panel-tag"><Users size={18} /> {residents.length} residents</span>
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
                  placeholder="Electricity amount"
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
              <button type="button" className="add-button" onClick={addExpense}><Plus size={22} strokeWidth={2.6} /> Add expense</button>
            </div>
          </details>

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
                    {allRoomsFilled ? `QAR ${formatAmount(monthlyPerPerson)}` : 'QAR 0.00'}
                  </span>
                  <span className="room-share-value">
                    <small>Monthly per room</small>
                    {allRoomsFilled ? `QAR ${formatAmount((Number(roomPeople[index]) || 0) * monthlyPerPerson)}` : 'QAR 0.00'}
                  </span>
                  <span className="room-share-value">
                    <small>Daily per person</small>
                    {allRoomsFilled ? `QAR ${formatAmount(dailyPerPerson)}` : 'QAR 0.00'}
                  </span>
                </div>
              ))}
            </div>
            <div className="room-share-counts">
              <span>Total room people <strong>{totalPeople}</strong></span>
              <span>Total person-days <strong>{totalPersonDays}</strong></span>
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
            <Download size={23} strokeWidth={2.3} />
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Electricity Bill</th>
                <th scope="col">Total Person</th>
                <th scope="col">Daily per person</th>
                <th scope="col">Monthly per person</th>
                <th scope="col">Monthly per room</th>
                <th scope="col">Final per room</th>
              </tr>
            </thead>
            <tbody>
              {residents.map((resident, index) => (
                <tr key={resident}>
                  <td><span className="row-number">0{index + 1}</span>{resident}</td>
                  <td>QAR {formatAmount(individualShare)}</td>
                  <td>{Number(roomPeople[index]) || 0}</td>
                  <td>{allRoomsFilled ? `QAR ${formatAmount(dailyPerPerson)}` : 'QAR 0.00'}</td>
                  <td>{allRoomsFilled ? `QAR ${formatAmount(monthlyPerPerson)}` : 'QAR 0.00'}</td>
                  <td>{allRoomsFilled ? `QAR ${formatAmount((Number(roomPeople[index]) || 0) * monthlyPerPerson)}` : 'QAR 0.00'}</td>
                  <td>{allRoomsFilled ? `QAR ${formatAmount(individualShare + ((Number(roomPeople[index]) || 0) * monthlyPerPerson))}` : 'QAR 0.00'}</td>
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
