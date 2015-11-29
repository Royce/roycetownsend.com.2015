# Snake

```clojure
(ns ^:figwheel-always snake.core)

(enable-console-print!)

(def new-game-state
  {:history   '([1 3] [1 2] [1 1])
   :length    3
   :direction :south
   :crashed?  false
   :food      [10 10]})

(defonce app-state (atom new-game-state))

(add-watch app-state :print-state
           (fn [_ _ _ new-state] (println new-state)))

(defn on-js-reload []
;;   (reset! app-state new-game-state)
)
```

```clojure
{:history ([1 3] [1 2] [1 1]), :length 3, :direction :south, :crashed? false, :food [10 10]}
```

## Basic Movement

```clojure
(def direction->next-pos
  {:north (fn [[x y]] [x (- y 1)])
   :south (fn [[x y]] [x (+ y 1)])
   :west  (fn [[x y]] [(- x 1) y])
   :east  (fn [[x y]] [(+ x 1) y])})

((direction->next-pos :north) [3 3])
;=> [3 2]
```

```clojure
(defn advance-snake [state]
  (swap! state
    (fn [{:keys [direction] :as old-state}]
      (update-in old-state [:history]
                 #(conj % ((direction->next-pos direction) (first %)))))))

(advance-snake app-state)
```

```clojure
{:history ([1 3] [1 2] [1 1]), :length 3, :direction :south, :crashed? false, :food [10 10]}
```

```clojure
(defn direction-valid? [old-direction new-direction]
  (let [opposites {:north :south, :south :north, :east :west, :west :east}]
    ((comp not =) new-direction (old-direction opposites))))

(println (direction-valid? :north :south)) ;; false
```


## Event Queue


```clojure
(ns ^:figwheel-always snake.core
  (:require-macros [cljs.core.async.macros :refer [go]])
  (:require [cljs.core.async :refer [chan <! put!]]))
```

```clojure
(def channel (chan))
```

```clojure
(put! channel :advance)
(put! channel :north)
(put! channel :advance)
```

```clojure
(go (while true
  (handle-events (<! channel))))
```

```clojure
(defn handle-events [token]
  (cond
   (= token :advance)
   (do
     (advance-snake app-state)
     (println "*render*"))
   (some #{token} directions)
   (set-direction app-state token)
  ))
```

## Eating and crashing

```clojure
(defn eat-food-watcher [_k reference _os {[head & _] :history food :food}]
  (when (= head food)
    (swap! reference
           #(-> %
                (assoc :food [(rand-int 20) (rand-int 20)])
                (update-in [:length] inc)))))
```

```clojure
(defn crash-watcher [channel _k reference _os {:keys [history length crashed?] :as ns}]
  (let [[head & tail] (take length history)
        [x y]         head]
    (when (and (not crashed?)
               (or (not (and (<= 0 x 20) (<= 0 y 20)))
                   (some #{head} tail)))
      (swap! reference assoc :crashed? true)
      (put! channel :done))))
```

```clojure
(add-watch app-state :eat-food-watcher eat-food-watcher)
(add-watch app-state :crash-watcher (partial crash-watcher channel))

(defn cleanup-watchers []
  (remove-watch app-state :eat-food-watcher)
  (remove-watch app-state :crash-watcher))
```

```clojure
   ;; Added to handle-events
   (= token :done)
   (do
     (cleanup-watchers))
```


## Render

Add `[rum :as r]` as dependency.

```clojure
(ns ^:figwheel-always snake.core
  (:require-macros [cljs.core.async.macros :refer [go]])
  (:require [cljs.core.async :refer [chan <! put!]]
            [rum :as r]))
```

```clojure
(defn explode-coord [[x y]]
  [(+ 5 (* 10 x))
   (+ 5 (* 10 y))])

(r/defc ui []
  (let [state @app-state
        {:keys [history length food]} state]
    [:svg {:width 210 :height 210}
     (->> (take length history)
          (map explode-coord)
          (partition 2 1)
          (map (fn [[[x1 y1] [x2 y2]]]
                 [:line {:x1 x1 :y1 y1
                         :x2 x2 :y2 y2
                         :style {:stroke "rgb(200,0,100)"
                                 :strokeWidth 10}}])))
     (let [[cx cy] (explode-coord food)]
       [:circle {:cx cx :cy cy :r 5 :fill "red"}])]))
```

```clojure
(let [container (.getElementById js/document "app")
      component (r/mount (ui) container)]
  (defn render [] (r/request-render component)))
```

Add `render`

```clojure
(defn handle-events [token]
  (println token)
  (cond
   (= token :advance)
   (do
     (advance-snake app-state)
     (render))
   (some #{token} directions)
   (set-direction app-state token)
   (= token :done)
   (do
     (cleanup-watchers))
  ))
```

## User (player) and Timer events

```clojure
(def key->direction
  {38 :north
   40 :south
   37 :west
   39 :east})

(defn map-keycode [keycode-lookup out-channel event]
  (let [keycode (.-keyCode event)
        mapped (keycode-lookup keycode)]
    (if (not (nil? mapped))
      (put! out-channel mapped))))
```

```clojure
  (aset container "onkeydown" (partial map-keycode key->direction channel))
```

```clojure
```


