var chacheName = 'weatherPWA';
var dataCacheName = 'weatherData';
var filesToChache = [
    '/',
    '/index.html',
    '/scripts/app.js',
    '/styles/inline.css',
    '/images/clear.png',
    '/images/cloudy-scattered-showers.png',
    '/images/cloudy.png',
    '/images/fog.png',
    '/images/ic_add_white_24px.svg',
    '/images/ic_refresh_white_24px.svg',
    '/images/partly-cloudy.png',
    '/images/rain.png',
    '/images/scattered-showers.png',
    '/images/sleet.png',
    '/images/snow.png',
    '/images/thunderstorm.png',
    '/images/wind.png'
];

self.addEventListener('install', function(e){
    console.log('Service Worker Installation');
    e.waitUntil(
        caches.open(chacheName)
            .then(function(cache) {
                console.log('Service Worker Chaching App Shell');
                return cache.addAll(filesToChache);
            })
    );
});

self.addEventListener('active', function(e){
    console.log('Service Worker Activated');
    e.waitUntil(
        caches.keys()
            .then(function(keyList){
                return Promise.all(keyList.map(function(key){
                    if (key !== chacheName && key !== dataCacheName){
                        console.log('Service Worker removing old cache', key);
                        return caches.delete(key);
                    }
                }));
            })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', function(e){
    console.log('Service Worker fetching', e.request.url);
    var dataUrl = 'https://query.yahooapis.com/v1/public/yql';
    if (e.request.url.indexOf(dataUrl) > -1) {
        e.respondWith(
            caches.open(dataCacheName)
                .then(function(cache){
                    return fetch(e.request)
                        .then(function(response){
                            cache.put(e.request.url, response.clone());
                            return response;
                        });
                })
        );
    } else {   
        e.respondWith(
            caches.match(e.request)
                .then(function(response){
                    return response || fetch(e.request);
                })
        );
    }
});
