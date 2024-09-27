count-observations =
    { $count ->
        [one] 1 observation
       *[other] { $count } observations
    }
date-format-short = d/M/yy
date-observed = Date observed: { $date }
date-uploaded = Date uploaded: { $date }
datetime-format-short = d/M/yy h:mm a
# Label for a view that shows observations as a grid of photos
Grid-View = Grid View
# Label for a view that shows observations a list
List-View = List View
Observations = Observations
Your-Observations = Tus observaciones
