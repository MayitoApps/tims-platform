const fs = require('fs');
const path = require('path');

const pagePath = path.resolve('app/page.tsx');
let pageCode = fs.readFileSync(pagePath, 'utf8').replace(/\r\n/g, '\n');

const oldFetchBlock = `    // 3. Sync Deals from Postgres Database
    fetch('/api/deals')
      .then((res) => res.json())
      .then((data) => {
        if (data?.deals && Array.isArray(data.deals) && data.deals.length > 0) {
          setDeals(data.deals);
          try {
            localStorage.setItem('tims_deals', JSON.stringify(data.deals));
          } catch {}
        }
      })
      .catch((err) => console.error('Error fetching deals from DB:', err));

    // 4. Sync Marketing Tasks from Postgres Database
    fetch('/api/marketing-tasks')
      .then((res) => res.json())
      .then((data) => {
        if (data?.tasks && Array.isArray(data.tasks) && data.tasks.length > 0) {
          setMarketingTasks(data.tasks);
          try {
            localStorage.setItem('tims_mkt_tasks', JSON.stringify(data.tasks));
          } catch {}
        }
      })
      .catch((err) => console.error('Error fetching marketing tasks from DB:', err));
  }, []);`;

const newFetchBlock = `    // 3. Función de Sincronización en Tiempo Real con Postgres
    const syncDataFromCloud = () => {
      // Sync Deals
      fetch('/api/deals')
        .then((res) => res.json())
        .then((data) => {
          if (data?.deals && Array.isArray(data.deals) && data.deals.length > 0) {
            setDeals(data.deals);
            try {
              localStorage.setItem('tims_deals', JSON.stringify(data.deals));
            } catch {}
          }
        })
        .catch(() => {});

      // Sync Marketing Tasks
      fetch('/api/marketing-tasks')
        .then((res) => res.json())
        .then((data) => {
          if (data?.tasks && Array.isArray(data.tasks) && data.tasks.length > 0) {
            setMarketingTasks(data.tasks);
            try {
              localStorage.setItem('tims_mkt_tasks', JSON.stringify(data.tasks));
            } catch {}
          }
        })
        .catch(() => {});
    };

    // Consulta inicial inmediata
    syncDataFromCloud();

    // Sincronización recurrente en segundo plano (cada 8 segundos y cuando la ventana toma foco)
    const syncInterval = setInterval(syncDataFromCloud, 8000);
    const onWindowFocus = () => syncDataFromCloud();
    window.addEventListener('focus', onWindowFocus);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('focus', onWindowFocus);
    };
  }, []);`;

if (pageCode.includes(oldFetchBlock)) {
  pageCode = pageCode.replace(oldFetchBlock, newFetchBlock);
  fs.writeFileSync(pagePath, pageCode, 'utf8');
  console.log('app/page.tsx updated with real-time background sync!');
} else {
  console.log('Could not find oldFetchBlock in app/page.tsx');
}
