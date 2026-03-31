// menu admin
async function loadMenu(activeId) {
    try {
        const response = await fetch('menu.html');
        const data = await response.text();
        document.getElementById('sidebar-container').innerHTML = data;
        
        // Active item hiện tại
        const activeItem = document.getElementById(activeId);
        if (activeItem) activeItem.classList.add('active');
    } catch (error) {
        console.error('Lỗi khi tải menu:', error);
    }
}