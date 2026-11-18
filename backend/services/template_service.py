"""
DataSense AI — Template Service
Generates realistic sample datasets for 16 business domains.
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import string

rng = np.random.default_rng(42)


def _random_dates(start: str, end: str, n: int) -> list:
    s = pd.Timestamp(start)
    e = pd.Timestamp(end)
    delta = (e - s).days
    return [(s + timedelta(days=int(rng.integers(0, delta)))).strftime("%Y-%m-%d") for _ in range(n)]


def _gen_sales(n=500) -> pd.DataFrame:
    products = ["Laptop", "Phone", "Tablet", "Monitor", "Keyboard", "Mouse", "Headset", "Webcam"]
    categories = ["Electronics", "Accessories", "Peripherals"]
    regions = ["North", "South", "East", "West", "Central"]
    salespeople = ["Rahul", "Priya", "Ankit", "Sneha", "Vijay", "Meera", "Arjun", "Divya"]
    dates = _random_dates("2024-01-01", "2024-12-31", n)
    units = rng.integers(1, 50, n)
    price = rng.uniform(500, 80000, n).round(2)
    discount = rng.uniform(0, 0.3, n).round(2)
    revenue = (units * price * (1 - discount)).round(2)
    profit = (revenue * rng.uniform(0.1, 0.4, n)).round(2)
    return pd.DataFrame({
        "Date": dates,
        "Product": rng.choice(products, n),
        "Category": rng.choice(categories, n),
        "Region": rng.choice(regions, n),
        "Salesperson": rng.choice(salespeople, n),
        "Units_Sold": units,
        "Unit_Price": price,
        "Discount_Pct": discount,
        "Revenue": revenue,
        "Profit": profit,
    })


def _gen_loan(n=500) -> pd.DataFrame:
    statuses = ["Active", "Closed", "Default", "NPA", "Restructured"]
    dates = _random_dates("2023-01-01", "2024-12-31", n)
    amounts = rng.uniform(50000, 5000000, n).round(0)
    rates = rng.uniform(7.5, 18.5, n).round(2)
    tenures = rng.integers(12, 360, n)
    emis = (amounts * rates / 1200 / (1 - (1 + rates / 1200) ** (-tenures))).round(2)
    credit_scores = rng.integers(550, 850, n)
    days_overdue = np.where(rng.random(n) < 0.2, rng.integers(1, 180, n), 0)
    return pd.DataFrame({
        "Loan_ID": [f"LN{10000+i}" for i in range(n)],
        "Loan_Amount": amounts,
        "Interest_Rate": rates,
        "Tenure_Months": tenures,
        "EMI": emis,
        "Status": rng.choice(statuses, n, p=[0.5, 0.25, 0.1, 0.08, 0.07]),
        "Disbursement_Date": dates,
        "Credit_Score": credit_scores,
        "Days_Overdue": days_overdue,
        "Outstanding_Balance": (amounts * rng.uniform(0.2, 0.95, n)).round(2),
    })


def _gen_hr(n=500) -> pd.DataFrame:
    depts = ["Engineering", "Sales", "HR", "Finance", "Marketing", "Operations", "Legal"]
    designations = ["Analyst", "Senior Analyst", "Manager", "Senior Manager", "Director", "VP"]
    genders = ["Male", "Female", "Other"]
    joining = _random_dates("2018-01-01", "2024-06-01", n)
    salaries = rng.uniform(300000, 3000000, n).round(0)
    ages = rng.integers(22, 58, n)
    ratings = rng.choice([1, 2, 3, 4, 5], n, p=[0.05, 0.1, 0.3, 0.35, 0.2])
    attrition = np.where(rng.random(n) < 0.15, "Yes", "No")
    return pd.DataFrame({
        "Employee_ID": [f"EMP{1000+i}" for i in range(n)],
        "Department": rng.choice(depts, n),
        "Designation": rng.choice(designations, n),
        "Salary": salaries,
        "Joining_Date": joining,
        "Age": ages,
        "Gender": rng.choice(genders, n, p=[0.55, 0.42, 0.03]),
        "Performance_Rating": ratings,
        "Attrition": attrition,
        "Years_Experience": rng.integers(1, 30, n),
    })


def _gen_marketing(n=500) -> pd.DataFrame:
    channels = ["Google Ads", "Facebook", "Instagram", "LinkedIn", "Email", "SEO", "YouTube"]
    campaigns = ["Brand Awareness", "Lead Gen", "Retargeting", "Seasonal", "Product Launch"]
    dates = _random_dates("2024-01-01", "2024-12-31", n)
    impressions = rng.integers(1000, 500000, n)
    clicks = (impressions * rng.uniform(0.005, 0.08, n)).astype(int)
    spend = rng.uniform(500, 50000, n).round(2)
    conversions = (clicks * rng.uniform(0.01, 0.15, n)).astype(int)
    revenue = (conversions * rng.uniform(500, 5000, n)).round(2)
    return pd.DataFrame({
        "Date": dates,
        "Campaign": rng.choice(campaigns, n),
        "Channel": rng.choice(channels, n),
        "Impressions": impressions,
        "Clicks": clicks,
        "CTR_Pct": (clicks / impressions * 100).round(3),
        "Spend": spend,
        "Conversions": conversions,
        "Revenue": revenue,
        "ROI_Pct": ((revenue - spend) / spend * 100).round(2),
    })


def _gen_ecommerce(n=500) -> pd.DataFrame:
    products = ["Shirt", "Jeans", "Shoes", "Watch", "Bag", "Sunglasses", "Belt", "Wallet"]
    categories = ["Clothing", "Footwear", "Accessories"]
    statuses = ["Delivered", "Processing", "Shipped", "Cancelled", "Returned"]
    dates = _random_dates("2024-01-01", "2024-12-31", n)
    price = rng.uniform(200, 5000, n).round(2)
    qty = rng.integers(1, 5, n)
    discount = rng.uniform(0, 0.4, n).round(2)
    total = (price * qty * (1 - discount)).round(2)
    return pd.DataFrame({
        "Order_ID": [f"ORD{100000+i}" for i in range(n)],
        "Date": dates,
        "Product": rng.choice(products, n),
        "Category": rng.choice(categories, n),
        "Price": price,
        "Quantity": qty,
        "Discount_Pct": discount,
        "Total_Amount": total,
        "Status": rng.choice(statuses, n, p=[0.6, 0.15, 0.12, 0.08, 0.05]),
        "Return_Flag": np.where(rng.random(n) < 0.08, "Yes", "No"),
    })


def _gen_hospital(n=500) -> pd.DataFrame:
    diagnoses = ["Diabetes", "Hypertension", "Fracture", "Infection", "Cardiac", "Respiratory", "Gastrointestinal"]
    wards = ["General", "ICU", "Pediatric", "Ortho", "Cardiac", "Emergency"]
    doctors = ["Dr. Sharma", "Dr. Patel", "Dr. Gupta", "Dr. Singh", "Dr. Mehta"]
    admission = _random_dates("2024-01-01", "2024-12-31", n)
    los = rng.integers(1, 30, n)
    bill = rng.uniform(5000, 500000, n).round(2)
    return pd.DataFrame({
        "Patient_ID": [f"PAT{10000+i}" for i in range(n)],
        "Age": rng.integers(1, 85, n),
        "Gender": rng.choice(["Male", "Female"], n),
        "Diagnosis": rng.choice(diagnoses, n),
        "Admission_Date": admission,
        "LOS_Days": los,
        "Bill_Amount": bill,
        "Doctor": rng.choice(doctors, n),
        "Ward": rng.choice(wards, n),
        "Insurance_Covered": np.where(rng.random(n) < 0.6, "Yes", "No"),
    })


def _gen_student(n=500) -> pd.DataFrame:
    classes = ["9A", "9B", "10A", "10B", "11A", "11B", "12A", "12B"]
    math = rng.integers(30, 100, n)
    science = rng.integers(30, 100, n)
    english = rng.integers(30, 100, n)
    hindi = rng.integers(30, 100, n)
    avg = ((math + science + english + hindi) / 4).round(1)
    grade = np.select(
        [avg >= 90, avg >= 75, avg >= 60, avg >= 45],
        ["A+", "A", "B", "C"],
        default="D"
    )
    return pd.DataFrame({
        "Student_ID": [f"STU{1000+i}" for i in range(n)],
        "Class": rng.choice(classes, n),
        "Math": math,
        "Science": science,
        "English": english,
        "Hindi": hindi,
        "Average": avg,
        "Attendance_Pct": rng.uniform(60, 100, n).round(1),
        "Grade": grade,
        "Pass_Fail": np.where(avg >= 40, "Pass", "Fail"),
    })


def _gen_real_estate(n=500) -> pd.DataFrame:
    types = ["Apartment", "Villa", "Plot", "Commercial", "Office"]
    cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Chennai", "Kolkata"]
    statuses = ["Available", "Sold", "Under Construction", "Rented"]
    area = rng.uniform(300, 5000, n).round(0)
    price_per_sqft = rng.uniform(3000, 25000, n).round(0)
    price = (area * price_per_sqft).round(0)
    dates = _random_dates("2023-01-01", "2024-12-31", n)
    return pd.DataFrame({
        "Property_ID": [f"PROP{1000+i}" for i in range(n)],
        "Type": rng.choice(types, n),
        "Area_sqft": area,
        "Bedrooms": rng.integers(1, 6, n),
        "City": rng.choice(cities, n),
        "Price": price,
        "Price_per_sqft": price_per_sqft,
        "Status": rng.choice(statuses, n, p=[0.4, 0.35, 0.15, 0.1]),
        "Listed_Date": dates,
        "Builder_Rating": rng.uniform(3.0, 5.0, n).round(1),
    })


def _gen_inventory(n=500) -> pd.DataFrame:
    categories = ["Electronics", "FMCG", "Pharma", "Textiles", "Auto Parts"]
    suppliers = ["SupplierA", "SupplierB", "SupplierC", "SupplierD"]
    stock = rng.integers(0, 1000, n)
    reorder = rng.integers(20, 100, n)
    unit_cost = rng.uniform(50, 5000, n).round(2)
    dates = _random_dates("2024-06-01", "2024-12-31", n)
    return pd.DataFrame({
        "Item_ID": [f"INV{1000+i}" for i in range(n)],
        "Product_Name": [f"Product_{rng.integers(100, 999)}" for _ in range(n)],
        "Category": rng.choice(categories, n),
        "Stock_Level": stock,
        "Reorder_Point": reorder,
        "Unit_Cost": unit_cost,
        "Supplier": rng.choice(suppliers, n),
        "Last_Restocked": dates,
        "Days_to_Stockout": np.where(stock > 0, (stock / rng.integers(1, 20, n)).astype(int), 0),
        "Status": np.where(stock <= reorder, "Reorder Required", "OK"),
    })


def _gen_credit_card(n=500) -> pd.DataFrame:
    categories = ["Groceries", "Travel", "Entertainment", "Shopping", "Dining", "Fuel", "Healthcare"]
    dates = _random_dates("2024-01-01", "2024-12-31", n)
    limit = rng.choice([50000, 100000, 200000, 500000], n)
    amount = rng.uniform(100, limit * 0.9, n).round(2)
    outstanding = rng.uniform(0, limit * 0.7, n).round(2)
    return pd.DataFrame({
        "Transaction_ID": [f"TXN{100000+i}" for i in range(n)],
        "Date": dates,
        "Category": rng.choice(categories, n),
        "Transaction_Amount": amount,
        "Credit_Limit": limit,
        "Outstanding_Balance": outstanding,
        "Utilization_Pct": (outstanding / limit * 100).round(2),
        "Payment_Status": rng.choice(["Paid", "Unpaid", "Partial"], n, p=[0.7, 0.15, 0.15]),
        "Reward_Points": rng.integers(0, 5000, n),
        "Late_Fee": np.where(rng.random(n) < 0.1, rng.integers(200, 1000, n), 0),
    })


def _gen_financial_pnl(n=24) -> pd.DataFrame:
    months = pd.date_range("2023-01-01", periods=n, freq="MS").strftime("%Y-%m").tolist()
    revenue = rng.uniform(5000000, 20000000, n).round(0)
    cogs = (revenue * rng.uniform(0.3, 0.5, n)).round(0)
    gross_profit = revenue - cogs
    opex = (revenue * rng.uniform(0.2, 0.35, n)).round(0)
    ebitda = gross_profit - opex
    net_profit = (ebitda * rng.uniform(0.6, 0.85, n)).round(0)
    return pd.DataFrame({
        "Month": months,
        "Revenue": revenue,
        "COGS": cogs,
        "Gross_Profit": gross_profit,
        "Operating_Expenses": opex,
        "EBITDA": ebitda,
        "Net_Profit": net_profit,
        "Gross_Margin_Pct": (gross_profit / revenue * 100).round(2),
        "Net_Margin_Pct": (net_profit / revenue * 100).round(2),
        "YoY_Growth_Pct": np.concatenate([[0] * 12, ((revenue[12:] - revenue[:12]) / revenue[:12] * 100).round(2)]),
    })


def _gen_vehicle_fleet(n=500) -> pd.DataFrame:
    types = ["Truck", "Van", "Car", "Bus", "Bike"]
    drivers = [f"Driver_{i}" for i in range(1, 21)]
    dates = _random_dates("2024-01-01", "2024-12-31", n)
    distance = rng.uniform(50, 800, n).round(1)
    fuel = (distance / rng.uniform(8, 20, n)).round(2)
    return pd.DataFrame({
        "Vehicle_ID": [f"VH{100+i}" for i in range(n)],
        "Type": rng.choice(types, n),
        "Driver": rng.choice(drivers, n),
        "Date": dates,
        "Distance_km": distance,
        "Fuel_Used_L": fuel,
        "Fuel_Efficiency_kmpl": (distance / fuel).round(2),
        "Maintenance_Cost": rng.uniform(0, 15000, n).round(2),
        "Route": rng.choice(["Route_A", "Route_B", "Route_C", "Route_D"], n),
        "On_Time": rng.choice(["Yes", "No"], n, p=[0.85, 0.15]),
    })


def _gen_website(n=365) -> pd.DataFrame:
    dates = pd.date_range("2024-01-01", periods=n, freq="D").strftime("%Y-%m-%d").tolist()
    sessions = rng.integers(500, 10000, n)
    users = (sessions * rng.uniform(0.6, 0.9, n)).astype(int)
    page_views = (sessions * rng.uniform(1.5, 4.0, n)).astype(int)
    conversions = (sessions * rng.uniform(0.01, 0.05, n)).astype(int)
    sources = ["Organic", "Paid", "Direct", "Social", "Referral", "Email"]
    return pd.DataFrame({
        "Date": dates,
        "Sessions": sessions,
        "Users": users,
        "Page_Views": page_views,
        "Bounce_Rate_Pct": rng.uniform(30, 75, n).round(2),
        "Avg_Session_Duration_s": rng.integers(30, 300, n),
        "Conversions": conversions,
        "Revenue": (conversions * rng.uniform(200, 2000, n)).round(2),
        "Top_Traffic_Source": rng.choice(sources, n),
    })


def _gen_restaurant(n=500) -> pd.DataFrame:
    items = ["Biryani", "Butter Chicken", "Dal Makhani", "Naan", "Paneer Tikka", "Lassi", "Gulab Jamun", "Pizza"]
    categories = ["Main Course", "Bread", "Appetizer", "Drink", "Dessert"]
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    dates = _random_dates("2024-01-01", "2024-12-31", n)
    orders = rng.integers(5, 80, n)
    price = rng.uniform(80, 600, n).round(2)
    return pd.DataFrame({
        "Date": dates,
        "Item": rng.choice(items, n),
        "Category": rng.choice(categories, n),
        "Orders": orders,
        "Revenue": (orders * price).round(2),
        "Avg_Rating": rng.uniform(3.0, 5.0, n).round(1),
        "Prep_Time_mins": rng.integers(5, 45, n),
        "Peak_Hour": rng.choice(["12-2 PM", "7-9 PM", "3-5 PM"], n),
        "Day_of_Week": rng.choice(days, n),
        "Waste_Pct": rng.uniform(0, 15, n).round(1),
    })


def _gen_manufacturing(n=500) -> pd.DataFrame:
    product_lines = ["Line A", "Line B", "Line C", "Line D"]
    operators = [f"Operator_{i}" for i in range(1, 11)]
    dates = _random_dates("2024-01-01", "2024-12-31", n)
    produced = rng.integers(100, 2000, n)
    defect_rate = rng.uniform(0.005, 0.08, n)
    defects = (produced * defect_rate).astype(int)
    return pd.DataFrame({
        "Date": dates,
        "Product_Line": rng.choice(product_lines, n),
        "Units_Produced": produced,
        "Defects": defects,
        "Defect_Rate_Pct": (defect_rate * 100).round(2),
        "OEE_Pct": rng.uniform(55, 95, n).round(2),
        "Downtime_Hours": rng.uniform(0, 4, n).round(2),
        "Production_Cost": rng.uniform(50000, 500000, n).round(2),
        "Operator": rng.choice(operators, n),
        "Shift": rng.choice(["Morning", "Evening", "Night"], n),
    })


def _gen_app_analytics(n=365) -> pd.DataFrame:
    dates = pd.date_range("2024-01-01", periods=n, freq="D").strftime("%Y-%m-%d").tolist()
    dau = rng.integers(1000, 50000, n)
    features = ["Dashboard", "Reports", "Chat", "Upload", "Settings", "Export"]
    return pd.DataFrame({
        "Date": dates,
        "DAU": dau,
        "MAU": (dau * rng.uniform(5, 15, n)).astype(int),
        "New_Users": (dau * rng.uniform(0.05, 0.2, n)).astype(int),
        "Sessions": (dau * rng.uniform(1.2, 2.5, n)).astype(int),
        "Avg_Session_mins": rng.uniform(3, 25, n).round(1),
        "Top_Feature": rng.choice(features, n),
        "Retention_D1_Pct": rng.uniform(20, 60, n).round(2),
        "Retention_D7_Pct": rng.uniform(10, 35, n).round(2),
        "Revenue": rng.uniform(5000, 100000, n).round(2),
    })


_GENERATORS = {
    "sales_dashboard": _gen_sales,
    "loan_portfolio": _gen_loan,
    "hr_analytics": _gen_hr,
    "marketing_campaign": _gen_marketing,
    "ecommerce_store": _gen_ecommerce,
    "hospital_records": _gen_hospital,
    "student_performance": _gen_student,
    "real_estate": _gen_real_estate,
    "inventory_management": _gen_inventory,
    "credit_card": _gen_credit_card,
    "financial_pnl": _gen_financial_pnl,
    "vehicle_fleet": _gen_vehicle_fleet,
    "website_analytics": _gen_website,
    "restaurant": _gen_restaurant,
    "manufacturing": _gen_manufacturing,
    "app_analytics": _gen_app_analytics,
}

_TEMPLATE_META = [
    {"id": "sales_dashboard", "name": "Sales Dashboard", "emoji": "💰", "industry": "Sales", "description": "Monthly sales, product performance, regional breakdown", "rows": 500},
    {"id": "loan_portfolio", "name": "Loan Portfolio", "emoji": "🏦", "industry": "Finance", "description": "EMI tracker, default rate, disbursement analysis", "rows": 500},
    {"id": "hr_analytics", "name": "HR Analytics", "emoji": "👥", "industry": "HR", "description": "Headcount, attrition, salary bands, hiring funnel", "rows": 500},
    {"id": "marketing_campaign", "name": "Marketing Campaign", "emoji": "📈", "industry": "Marketing", "description": "CTR, conversion, spend vs revenue ROI", "rows": 500},
    {"id": "ecommerce_store", "name": "E-commerce Store", "emoji": "🛒", "industry": "E-commerce", "description": "Orders, revenue, returns, top products", "rows": 500},
    {"id": "hospital_records", "name": "Hospital Records", "emoji": "💊", "industry": "Healthcare", "description": "Patient stats, diagnosis, admission trends", "rows": 500},
    {"id": "student_performance", "name": "Student Performance", "emoji": "🎓", "industry": "Education", "description": "Grades, attendance, subject-wise analysis", "rows": 500},
    {"id": "real_estate", "name": "Real Estate", "emoji": "🏠", "industry": "Real Estate", "description": "Property listings, price trends, area comparison", "rows": 500},
    {"id": "inventory_management", "name": "Inventory Management", "emoji": "📦", "industry": "Operations", "description": "Stock levels, reorder points, turnover", "rows": 500},
    {"id": "credit_card", "name": "Credit Card Analysis", "emoji": "💳", "industry": "Finance", "description": "Spending categories, limits, utilization", "rows": 500},
    {"id": "financial_pnl", "name": "Financial P&L", "emoji": "📊", "industry": "Finance", "description": "Revenue, expenses, EBITDA, margins", "rows": 24},
    {"id": "vehicle_fleet", "name": "Vehicle Fleet", "emoji": "🚗", "industry": "Operations", "description": "Fuel costs, maintenance, route efficiency", "rows": 500},
    {"id": "website_analytics", "name": "Website Analytics", "emoji": "🌐", "industry": "Marketing", "description": "Sessions, bounce rate, conversions", "rows": 365},
    {"id": "restaurant", "name": "Restaurant / Café", "emoji": "☕", "industry": "Hospitality", "description": "Menu performance, peak hours, revenue", "rows": 500},
    {"id": "manufacturing", "name": "Manufacturing", "emoji": "🏭", "industry": "Manufacturing", "description": "Production output, defect rate, efficiency", "rows": 500},
    {"id": "app_analytics", "name": "App Analytics", "emoji": "📱", "industry": "Tech", "description": "DAU, retention, feature usage", "rows": 365},
]


def generate_template_data(template_name: str) -> pd.DataFrame:
    """Generate realistic sample data for the specified template."""
    gen_fn = _GENERATORS.get(template_name)
    if not gen_fn:
        raise ValueError(f"Unknown template: {template_name}")
    return gen_fn()


def get_template_info() -> list:
    """Return list of all templates with metadata."""
    return _TEMPLATE_META
