1.快速对接。

1.1 目前代码是单实例测试代码，数据只有一份（定义一个类后创建了一个实例，用这个单例测试代码），实例和对应修改的方法整合到了singleUser类中，后端代码可以以此作为基础修改（或者把这一部分并入后端代码）。MockDeadlineStorage类、MockLocalStorage类、ScheduleTypeColorMapper类、ThemeMode类、MonthNumManager类均是单例。

1.2 把日程加入月界面可能需要借助AI将日程进行分类。ScheduleTypeColorMapper类是将日程类型映射为颜色的类，getTypes方法获取所有日程类型，可能要借助AI将日程按照存在的日程类型进行分类（日程类型支持编辑）。MockLocalStorage类是月界面日程操作的类，添加、删除日程的时候日期的格式是YYYY-MM-DD，日程类型是现有日程类型。

1.3 stackNavigation.js实现界面跳转，目前周界面使用一个简单的类模拟。后续要把真正的周界面引入，实现真正的跳转。

1.4 calendar.js中实现了渲染后滚动到当前月，当前月显示在屏幕中央，但是屏幕最上面可能还要加组件，如果增加需要重新测试组件的高度，修改滚动的偏移量。


2.每个js文件详细解释。

2.1 singleMonth.js：定义SingleMonth类。有两种模式，日程模式和截止模式，通过一个开关控制。日程模式下，点击日期块可以跳转（后续实现跳转到周界面），目前传递了被点击日期块的日期。截止模式下，点击日期块可以显示当天的截止任务。样式上，支持三种主题模式：简约、黑夜、蜂巢。每个主题模式下，均实现了当前月标题特殊颜色和当天日期块加粗边框，周末、非当前月的日期块的背景和文字均与当前月工作日不同。日期块内容：日程模式下，每个日期块显示一个日程（如有）对应颜色的圆点（目前实现的是每天显示一个或者零个日程）；截止模式下，每个日期块显示当天DDL（如有）的数量，显示"DDL*N"（N为当天DDL数量）。

2.2 calendar.js：定义Calendar类。按照指定渲染的当前月之前、之后的月数进行渲染（渲染之前、之后月数支持修改，在numOfMonth.js中的MonthNumManager类中实现）。同样支持三种主题模式：简约、黑夜、蜂巢。

2.3 mockDeadlineStorage.js：定义MockDeadlineStorage类，存储DDL信息。

2.4 mockLocalStorage.js：定义MockLocalStorage类，存储日程信息（只精确到日，未精确到时刻）。

2.5 modeButton.js：定义ModeButton类。用于在不同主题模式下实现不同样式的按钮。

2.6 numOfMonth.js：定义MonthNumManager类。用于编辑要渲染的当前月之前、之后的月数。

2.7 scheduleTypeColorMapper.js：定义ScheduleTypeColorMapper类。用于日程类型和颜色的对应。

2.8 stackNavigator.js：实现界面跳转。

2.9 themeMode.js：定义ThemeMode类，实现不同主题模式的切换。

2.10 singleUser.js：定义SingleUser类，把后续需要多份数据的实例和方法整合到一个用户类中。


3.用户自定义部分

3.1 主题模式。

3.2 需要渲染的当前月之前、之后的月数。

3.3 日程类型和颜色的对应。


4.当前示例引入：放在当前文件夹的App.js中。
