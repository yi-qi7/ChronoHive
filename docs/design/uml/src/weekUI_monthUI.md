@startuml
class WeekUI{
    weekContainer: WeekContainer
    +currentTime: Time

    +askAI():void
    +showSetting():void

}
class MonthUI{
    monthContainer:MonthContainer
    +askAI():void
    +showSetting():void
}

class MonthContainer{
    currentMonth:int
    daysNumber:int
    dayContainer[daysNumber]:DayContainer
    
}

class WeekContainer{
    +weekNumber:string
    +dayContainer[7]: DayContainer
    
}

class DayContainer{
    -date:class Time
    -isToday:boolean
    -allSchedule: Linked List //链表

    +showAvailable():void //显示空闲时间
}

class ScheduleItem{
    id:int
    title:string
    startTime: Time
    endTime: Time
    remindTime: Time
    -isCompleted:boolean
    +updateSchedule():void//修改日程
    +addSchedule():void//增加日程
    +deleteSchedule():void//删除日程
    -color:string
}

class Time{
    +year:int 
    +month: int
    +day:int
    +hour:int
    +minute:int
    +second:int
    weekday:string
    +showISOType(): string
}

WeekUI -r-> WeekContainer

WeekContainer --> DayContainer
DayContainer o-- ScheduleItem
WeekUI o-d- Time
DayContainer o-l- Time
ScheduleItem o-l- Time

MonthContainer -l-> DayContainer
MonthUI -d-> MonthContainer

@enduml
