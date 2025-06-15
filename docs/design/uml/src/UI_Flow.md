@startuml

LoginUI -r-> WeekUI: log in successfully
WeekUI -r-> MonthUI: click month
MonthUI --> WeekUI: click week
WeekUI --> AI_UI: ask AI
WeekUI --> SettingUI:click setting
MonthUI --> SettingUI:click setting
MonthUI -r-> AI_UI: ask AI


SettingUI --> LoginUI: log out
@enduml