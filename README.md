# WattWise — Smart Energy Saver ⚡

**WattWise** is a web-based energy management application designed to help households understand their electricity consumption, estimate energy costs, and identify opportunities to save electricity.

🌐 **Live website:** https://samxyp.github.io/wattwise-smart-energy-saver/

## 📌 Project Overview

Electricity expenses can be difficult to manage when users do not understand how much energy their appliances consume. WattWise addresses this problem by allowing users to enter appliance details, estimate electricity consumption, calculate costs, and monitor spending against user-defined limits.

The project supports **United Nations Sustainable Development Goal 7 (SDG 7): Affordable and Clean Energy**, particularly the promotion of energy efficiency.

## 🎯 Objectives

- Estimate electricity consumption for household appliances.
- Calculate estimated electricity costs using a user-entered tariff.
- Identify appliances with relatively high estimated energy consumption.
- Help users monitor daily and weekly electricity spending limits.
- Provide practical energy-saving tips.
- Demonstrate how a web application can support responsible electricity usage.

## ✨ Features

- **Appliance calculator:** Enter appliance power ratings, quantities, and daily usage hours.
- **Cost estimation:** Calculate estimated electricity costs using the tariff entered by the user.
- **Consumption dashboard:** View estimated energy usage and costs across different periods.
- **Visualisation:** Display consumption information using a doughnut chart.
- **Budget alerts:** Set daily and weekly spending limits and receive warnings when estimated costs exceed them.
- **Appliance management:** Add, edit, and remove appliances.
- **Energy-saving tips:** Explore suggestions for reducing electricity consumption.
- **Meter connection information:** Learn about possible future integration with compatible smart meters and appliance-level monitoring devices.
- **Responsive interface:** Use the website on supported desktop and mobile browsers.
- **Local data storage:** Save supported settings and data in the browser using localStorage.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Structures the website content. |
| CSS3 | Controls styling, layout, colours, and responsive design. |
| JavaScript | Handles calculations, user interactions, alerts, and data management. |
| Chart.js | Displays energy consumption data visually. |
| Git | Tracks changes and maintains project versions. |
| GitHub | Hosts the source code and supports collaboration. |
| GitHub Pages | Publishes the website online. |

## ⚡ Energy Calculation Method

WattWise estimates energy consumption using the following formula:

**Energy consumption (kWh)**

Energy (kWh) = Power (W) × Quantity × Hours per day × Number of days ÷ 1,000

**Estimated electricity cost**

Cost = Energy consumption (kWh) × Electricity tariff (₦/kWh)

For example, a 1,000-watt appliance used for 5 hours per day over 30 days has an estimated consumption of:

1,000 × 1 × 5 × 30 ÷ 1,000 = **150 kWh**

At an illustrative tariff of ₦200 per kWh, the estimated cost is ₦30,000.

Actual costs depend on the applicable tariff, billing arrangements, appliance behaviour, and real consumption.

## 🚀 How to Run the Project Locally

1. Install [Visual Studio Code](https://code.visualstudio.com/).
2. Download or clone this repository.
3. Open the project folder in VS Code.
4. Open `index.html` using a local development server, such as the Live Server extension.
5. Use the website in your browser.

No physical energy meter is required to use the estimation features.

## 📂 Project Structure

- `index.html` — website structure and content.
- `styles.css` — visual styling and responsive layouts.
- `app.js` — calculations, application logic, interactions, and data handling.
- `README.md` — project documentation.
- `WattWise_Project_Report.pdf` — project report included in the repository.

## ⚠️ Limitations

WattWise currently provides estimates based on user-entered appliance information and electricity tariffs. It does not independently measure actual electricity consumption or communicate with a physical prepaid meter.

A main household meter normally measures combined consumption rather than identifying the exact consumption of every appliance. Individual appliance monitoring would require suitable smart plugs, sub-meters, compatible connected devices, or another supported measurement system.

Browser-stored data may not automatically synchronise between devices.

## 🔮 Future Improvements

- Integrate compatible smart meters through an approved interface or API.
- Support appliance-level measurements from suitable monitoring hardware.
- Compare estimated consumption with actual meter readings.
- Improve personalised energy-saving recommendations.
- Add historical consumption reports and comparisons.
- Explore secure cloud storage and user accounts.

## 🌍 Sustainable Development Goal

WattWise supports **SDG 7: Affordable and Clean Energy** by promoting awareness of electricity consumption, energy efficiency, and informed household energy management.

## 👨‍💻 Project Information

**Project:** WattWise — Smart Energy Saver  
**Programme:** Programmer in Community Innovation Hub

## 📄 Disclaimer

WattWise is an educational project intended to demonstrate energy estimation and energy-awareness concepts. Its calculated values are estimates, not certified meter readings or guaranteed electricity bills.
