count-observations =
    { $count ->
        [one] { $count } наблюдение
        [few] { $count } наблюдения
        [many] { $count } наблюдений
       *[other] { $count } наблюдений
    }
date-observed = Дата наблюдения: { $date }
date-uploaded = Дата загрузки: { $date }
# Label for a view that shows observations as a grid of photos
Grid-View = Вид сетки
# Label for a view that shows observations a list
List-View = Вид списка
Observations = Замечания
Your-Observations = Your Observations
