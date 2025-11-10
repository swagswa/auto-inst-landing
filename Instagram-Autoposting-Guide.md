# Полное руководство по разработке системы автопостинга в Instagram

## 📋 Содержание

1. [Архитектура системы](#архитектура-системы)
2. [Техническая инфраструктура](#техническая-инфраструктура)
3. [Настройка эмуляторов](#настройка-эмуляторов)
4. [Автоматизация и скрипты](#автоматизация-и-скрипты)
5. [База данных и управление аккаунтами](#база-данных-и-управление-аккаунтами)
6. [Система прокси и безопасность](#система-прокси-и-безопасность)
7. [Мониторинг и логирование](#мониторинг-и-логирование)
8. [Развертывание и масштабирование](#развертывание-и-масштабирование)
9. [Обслуживание и оптимизация](#обслуживание-и-оптимизация)

---

## 🏗️ Архитектура системы

### Общая схема

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Panel     │    │  Control Server │    │  Emulator Farm  │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (LDPlayer)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Database     │    │  Proxy Manager  │    │  Content Store  │
│   (PostgreSQL)  │    │   (Rotating)    │    │   (Media Files) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Компоненты системы

#### 1. **Control Server (Центральный сервер)**
- **Язык:** Python 3.9+
- **Фреймворк:** FastAPI или Django
- **Функции:**
  - Управление задачами постинга
  - Координация эмуляторов
  - API для веб-панели
  - Планировщик задач

#### 2. **Emulator Farm (Ферма эмуляторов)**
- **Эмулятор:** LDPlayer 9
- **Автоматизация:** Appium + Python
- **Количество:** 100+ инстансов
- **Распределение:** 15-20 на сервер

#### 3. **Database (База данных)**
- **СУБД:** PostgreSQL 14+
- **Альтернатива:** MySQL 8.0+
- **Функции:**
  - Хранение аккаунтов
  - История постов
  - Настройки и конфигурации

#### 4. **Web Panel (Веб-панель)**
- **Frontend:** React.js + TypeScript
- **UI Framework:** Material-UI или Ant Design
- **Функции:**
  - Управление аккаунтами
  - Планирование постов
  - Мониторинг статистики

---

## 🖥️ Техническая инфраструктура

### Требования к серверам

#### **Основной сервер (Control Server)**
```yaml
Характеристики:
  CPU: 8+ ядер (Intel i7/Xeon или AMD Ryzen 7)
  RAM: 32GB DDR4
  Storage: 1TB NVMe SSD
  Network: 1Gbps
  OS: Ubuntu 20.04 LTS или Windows Server 2019

Роль:
  - Центральное управление
  - База данных
  - Веб-панель
  - API сервер
```

#### **Серверы эмуляторов (Emulator Nodes)**
```yaml
Характеристики:
  CPU: 16+ ядер (высокая частота важнее количества)
  RAM: 64GB DDR4
  Storage: 2TB NVMe SSD
  GPU: Не критично (встроенная подойдет)
  Network: 1Gbps
  OS: Windows 10/11 Pro или Windows Server

Количество эмуляторов на сервер: 15-20
Общее количество серверов: 5-7 штук
```

### Сетевая архитектура

```
Internet
    │
    ▼
┌─────────────────┐
│   Load Balancer │ (Nginx/HAProxy)
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Control Server │ (API + Web Panel)
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Internal VPN   │ (WireGuard/OpenVPN)
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Emulator Nodes  │ (LDPlayer Instances)
└─────────────────┘
```

---

## 📱 Настройка эмуляторов

### Установка LDPlayer

#### **Системные требования**
```powershell
# Проверка системы
Get-ComputerInfo | Select-Object TotalPhysicalMemory, CsProcessors
Get-WmiObject -Class Win32_LogicalDisk | Where-Object {$_.DriveType -eq 3}

# Включение виртуализации в BIOS
# Intel: VT-x
# AMD: AMD-V
```

#### **Установка и настройка**
```powershell
# Скачивание LDPlayer
Invoke-WebRequest -Uri "https://ldinst.ldmnq.com/download/LDPlayer9_ld.exe" -OutFile "LDPlayer9.exe"

# Тихая установка
.\LDPlayer9.exe /S /D=C:\LDPlayer

# Настройка переменных среды
[Environment]::SetEnvironmentVariable("LDPLAYER_PATH", "C:\LDPlayer", "Machine")
```

### Создание эмулятора-шаблона

#### **Базовые настройки**
```json
{
  "emulator_settings": {
    "name": "Instagram_Template",
    "android_version": "7.1",
    "resolution": "720x1280",
    "dpi": 320,
    "ram": 1024,
    "cpu_cores": 2,
    "graphics": "DirectX",
    "root": false,
    "shared_folder": true
  }
}
```

#### **Скрипт создания шаблона**
```python
import subprocess
import json
import time

class LDPlayerManager:
    def __init__(self, ldplayer_path="C:\\LDPlayer"):
        self.ldplayer_path = ldplayer_path
        self.ldconsole = f"{ldplayer_path}\\ldconsole.exe"
    
    def create_emulator(self, name, settings):
        """Создание нового эмулятора"""
        cmd = [
            self.ldconsole,
            "add",
            "--name", name,
            "--cpu", str(settings["cpu_cores"]),
            "--memory", str(settings["ram"]),
            "--resolution", settings["resolution"],
            "--dpi", str(settings["dpi"])
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Эмулятор {name} создан успешно")
            return True
        else:
            print(f"❌ Ошибка создания эмулятора: {result.stderr}")
            return False
    
    def configure_emulator(self, name, config):
        """Настройка эмулятора"""
        # Настройка прокси
        if "proxy" in config:
            self.set_proxy(name, config["proxy"])
        
        # Настройка устройства
        if "device_info" in config:
            self.set_device_info(name, config["device_info"])
        
        # Установка приложений
        if "apps" in config:
            for app in config["apps"]:
                self.install_app(name, app)
    
    def set_proxy(self, name, proxy_config):
        """Настройка прокси"""
        cmd = [
            self.ldconsole,
            "modify",
            "--name", name,
            "--proxy-type", proxy_config["type"],
            "--proxy-host", proxy_config["host"],
            "--proxy-port", str(proxy_config["port"])
        ]
        
        if "username" in proxy_config:
            cmd.extend(["--proxy-username", proxy_config["username"]])
            cmd.extend(["--proxy-password", proxy_config["password"]])
        
        subprocess.run(cmd)
    
    def clone_emulator(self, source_name, target_name):
        """Клонирование эмулятора"""
        cmd = [self.ldconsole, "copy", "--name", source_name, "--from", target_name]
        result = subprocess.run(cmd, capture_output=True, text=True)
        return result.returncode == 0

# Пример использования
manager = LDPlayerManager()

# Настройки шаблона
template_settings = {
    "cpu_cores": 2,
    "ram": 1024,
    "resolution": "720x1280",
    "dpi": 320
}

# Создание шаблона
manager.create_emulator("Instagram_Template", template_settings)
```

### Массовое создание эмуляторов

```python
import concurrent.futures
import threading
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class EmulatorConfig:
    name: str
    proxy: Dict[str, str]
    device_info: Dict[str, str]
    account_info: Dict[str, str]

class EmulatorFarm:
    def __init__(self, manager: LDPlayerManager):
        self.manager = manager
        self.emulators: List[EmulatorConfig] = []
        self.lock = threading.Lock()
    
    def generate_emulator_configs(self, count: int) -> List[EmulatorConfig]:
        """Генерация конфигураций для эмуляторов"""
        configs = []
        
        for i in range(count):
            config = EmulatorConfig(
                name=f"Instagram_Bot_{i+1:03d}",
                proxy=self.get_proxy_config(i),
                device_info=self.generate_device_info(i),
                account_info=self.get_account_info(i)
            )
            configs.append(config)
        
        return configs
    
    def get_proxy_config(self, index: int) -> Dict[str, str]:
        """Получение конфигурации прокси"""
        # Здесь должна быть логика получения прокси из пула
        return {
            "type": "http",
            "host": f"proxy{index % 10}.example.com",
            "port": "8080",
            "username": f"user{index}",
            "password": f"pass{index}"
        }
    
    def generate_device_info(self, index: int) -> Dict[str, str]:
        """Генерация информации об устройстве"""
        devices = [
            {"model": "SM-G973F", "brand": "Samsung", "manufacturer": "samsung"},
            {"model": "Pixel 4", "brand": "Google", "manufacturer": "Google"},
            {"model": "iPhone 12", "brand": "Apple", "manufacturer": "Apple"},
            {"model": "OnePlus 8", "brand": "OnePlus", "manufacturer": "OnePlus"}
        ]
        
        device = devices[index % len(devices)]
        return {
            **device,
            "imei": self.generate_imei(),
            "android_id": self.generate_android_id(),
            "serial": self.generate_serial()
        }
    
    def create_emulators_batch(self, configs: List[EmulatorConfig], batch_size: int = 5):
        """Создание эмуляторов пакетами"""
        with concurrent.futures.ThreadPoolExecutor(max_workers=batch_size) as executor:
            futures = []
            
            for config in configs:
                future = executor.submit(self.create_single_emulator, config)
                futures.append(future)
            
            # Ожидание завершения всех задач
            for future in concurrent.futures.as_completed(futures):
                try:
                    result = future.result()
                    if result:
                        print(f"✅ Эмулятор создан успешно")
                    else:
                        print(f"❌ Ошибка создания эмулятора")
                except Exception as e:
                    print(f"❌ Исключение при создании: {e}")
    
    def create_single_emulator(self, config: EmulatorConfig) -> bool:
        """Создание одного эмулятора"""
        try:
            # Клонирование из шаблона
            success = self.manager.clone_emulator("Instagram_Template", config.name)
            if not success:
                return False
            
            # Настройка эмулятора
            self.manager.configure_emulator(config.name, {
                "proxy": config.proxy,
                "device_info": config.device_info
            })
            
            with self.lock:
                self.emulators.append(config)
            
            return True
            
        except Exception as e:
            print(f"Ошибка создания эмулятора {config.name}: {e}")
            return False

# Использование
farm = EmulatorFarm(manager)
configs = farm.generate_emulator_configs(100)
farm.create_emulators_batch(configs, batch_size=3)
```

---

## 🤖 Автоматизация и скрипты

### Установка Appium

#### **Системные зависимости**
```bash
# Node.js (для Appium)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Java JDK (для Android SDK)
sudo apt install openjdk-11-jdk

# Android SDK
wget https://dl.google.com/android/repository/commandlinetools-linux-8512546_latest.zip
unzip commandlinetools-linux-8512546_latest.zip
```

#### **Установка Appium**
```bash
# Глобальная установка Appium
npm install -g appium

# Драйвер для Android
appium driver install uiautomator2

# Проверка установки
appium doctor --android
```

#### **Python зависимости**
```bash
pip install appium-python-client selenium webdriver-manager
```

### Базовый класс для автоматизации Instagram

```python
from appium import webdriver
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time
import random
import logging
from typing import Optional, List, Dict, Any

class InstagramBot:
    def __init__(self, emulator_name: str, appium_port: int = 4723):
        self.emulator_name = emulator_name
        self.appium_port = appium_port
        self.driver: Optional[webdriver.Remote] = None
        self.wait: Optional[WebDriverWait] = None
        self.logger = self._setup_logger()
        
        # Настройки для имитации человеческого поведения
        self.min_delay = 2
        self.max_delay = 5
        self.typing_delay = 0.1
        
    def _setup_logger(self) -> logging.Logger:
        """Настройка логгера"""
        logger = logging.getLogger(f"InstagramBot_{self.emulator_name}")
        logger.setLevel(logging.INFO)
        
        handler = logging.FileHandler(f"logs/{self.emulator_name}.log")
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        return logger
    
    def connect_to_emulator(self) -> bool:
        """Подключение к эмулятору"""
        desired_caps = {
            'platformName': 'Android',
            'platformVersion': '7.1',
            'deviceName': self.emulator_name,
            'appPackage': 'com.instagram.android',
            'appActivity': 'com.instagram.mainactivity.MainActivity',
            'automationName': 'UiAutomator2',
            'noReset': True,
            'fullReset': False,
            'newCommandTimeout': 300,
            'androidInstallTimeout': 300000
        }
        
        try:
            self.driver = webdriver.Remote(
                f'http://localhost:{self.appium_port}/wd/hub',
                desired_caps
            )
            self.wait = WebDriverWait(self.driver, 10)
            self.logger.info("✅ Успешно подключен к эмулятору")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Ошибка подключения к эмулятору: {e}")
            return False
    
    def human_delay(self, min_delay: Optional[float] = None, max_delay: Optional[float] = None):
        """Случайная задержка для имитации человеческого поведения"""
        min_d = min_delay or self.min_delay
        max_d = max_delay or self.max_delay
        delay = random.uniform(min_d, max_d)
        time.sleep(delay)
    
    def human_type(self, element, text: str):
        """Печать текста с человеческими задержками"""
        element.clear()
        for char in text:
            element.send_keys(char)
            time.sleep(random.uniform(0.05, self.typing_delay))
    
    def safe_click(self, locator: tuple, timeout: int = 10) -> bool:
        """Безопасный клик с ожиданием элемента"""
        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.element_to_be_clickable(locator)
            )
            self.human_delay(0.5, 1.5)
            element.click()
            return True
        except TimeoutException:
            self.logger.warning(f"Элемент не найден: {locator}")
            return False
    
    def safe_send_keys(self, locator: tuple, text: str, timeout: int = 10) -> bool:
        """Безопасный ввод текста"""
        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located(locator)
            )
            self.human_type(element, text)
            return True
        except TimeoutException:
            self.logger.warning(f"Поле ввода не найдено: {locator}")
            return False
    
    def login(self, username: str, password: str) -> bool:
        """Авторизация в Instagram"""
        try:
            self.logger.info(f"Начинаем авторизацию для {username}")
            
            # Ожидание загрузки экрана входа
            self.human_delay(3, 5)
            
            # Ввод логина
            username_field = (AppiumBy.ID, "com.instagram.android:id/login_username")
            if not self.safe_send_keys(username_field, username):
                return False
            
            # Ввод пароля
            password_field = (AppiumBy.ID, "com.instagram.android:id/password")
            if not self.safe_send_keys(password_field, password):
                return False
            
            # Нажатие кнопки входа
            login_button = (AppiumBy.ID, "com.instagram.android:id/button_text")
            if not self.safe_click(login_button):
                return False
            
            # Ожидание загрузки главного экрана
            self.human_delay(5, 8)
            
            # Проверка успешной авторизации
            if self._check_login_success():
                self.logger.info("✅ Авторизация успешна")
                return True
            else:
                self.logger.error("❌ Авторизация не удалась")
                return False
                
        except Exception as e:
            self.logger.error(f"Ошибка авторизации: {e}")
            return False
    
    def _check_login_success(self) -> bool:
        """Проверка успешной авторизации"""
        try:
            # Ищем элементы главного экрана
            home_indicators = [
                (AppiumBy.ID, "com.instagram.android:id/tab_home"),
                (AppiumBy.ID, "com.instagram.android:id/action_bar_home"),
                (AppiumBy.XPATH, "//android.widget.TextView[@text='Instagram']")
            ]
            
            for indicator in home_indicators:
                try:
                    WebDriverWait(self.driver, 5).until(
                        EC.presence_of_element_located(indicator)
                    )
                    return True
                except TimeoutException:
                    continue
            
            return False
            
        except Exception:
            return False
    
    def create_post(self, image_path: str, caption: str, hashtags: List[str] = None) -> bool:
        """Создание поста"""
        try:
            self.logger.info("Начинаем создание поста")
            
            # Нажатие кнопки создания поста
            create_button = (AppiumBy.ID, "com.instagram.android:id/tab_create")
            if not self.safe_click(create_button):
                return False
            
            # Выбор изображения
            if not self._select_image(image_path):
                return False
            
            # Переход к следующему экрану
            next_button = (AppiumBy.ID, "com.instagram.android:id/next_button_imageview")
            if not self.safe_click(next_button):
                return False
            
            # Пропуск фильтров
            self.human_delay(2, 3)
            if not self.safe_click(next_button):
                return False
            
            # Добавление подписи
            if not self._add_caption(caption, hashtags):
                return False
            
            # Публикация поста
            share_button = (AppiumBy.ID, "com.instagram.android:id/button_share")
            if not self.safe_click(share_button):
                return False
            
            # Ожидание публикации
            self.human_delay(5, 8)
            
            self.logger.info("✅ Пост успешно опубликован")
            return True
            
        except Exception as e:
            self.logger.error(f"Ошибка создания поста: {e}")
            return False
    
    def _select_image(self, image_path: str) -> bool:
        """Выбор изображения для поста"""
        try:
            # Логика выбора изображения из галереи
            # Это зависит от того, как организовано хранение изображений
            
            # Переход в галерею
            gallery_button = (AppiumBy.ID, "com.instagram.android:id/gallery_folder_menu")
            self.safe_click(gallery_button)
            
            # Выбор папки (если нужно)
            # ...
            
            # Выбор конкретного изображения
            # Здесь нужна логика поиска изображения по имени или позиции
            
            return True
            
        except Exception as e:
            self.logger.error(f"Ошибка выбора изображения: {e}")
            return False
    
    def _add_caption(self, caption: str, hashtags: List[str] = None) -> bool:
        """Добавление подписи к посту"""
        try:
            # Поле для ввода подписи
            caption_field = (AppiumBy.ID, "com.instagram.android:id/caption_text_view")
            
            # Формирование полного текста
            full_text = caption
            if hashtags:
                full_text += "\n\n" + " ".join(f"#{tag}" for tag in hashtags)
            
            return self.safe_send_keys(caption_field, full_text)
            
        except Exception as e:
            self.logger.error(f"Ошибка добавления подписи: {e}")
            return False
    
    def like_posts_by_hashtag(self, hashtag: str, count: int = 10) -> int:
        """Лайк постов по хештегу"""
        liked_count = 0
        
        try:
            # Поиск по хештегу
            if not self._search_hashtag(hashtag):
                return 0
            
            # Лайк постов
            for i in range(count):
                if self._like_current_post():
                    liked_count += 1
                    self.logger.info(f"Лайкнули пост {i+1}")
                
                # Переход к следующему посту
                self._scroll_to_next_post()
                self.human_delay(3, 7)  # Задержка между лайками
            
            return liked_count
            
        except Exception as e:
            self.logger.error(f"Ошибка лайка постов: {e}")
            return liked_count
    
    def _search_hashtag(self, hashtag: str) -> bool:
        """Поиск по хештегу"""
        try:
            # Нажатие на поиск
            search_button = (AppiumBy.ID, "com.instagram.android:id/tab_search")
            if not self.safe_click(search_button):
                return False
            
            # Ввод хештега
            search_field = (AppiumBy.ID, "com.instagram.android:id/action_bar_search_edit_text")
            if not self.safe_send_keys(search_field, f"#{hashtag}"):
                return False
            
            # Выбор хештега из результатов
            hashtag_result = (AppiumBy.XPATH, f"//android.widget.TextView[@text='#{hashtag}']")
            return self.safe_click(hashtag_result)
            
        except Exception as e:
            self.logger.error(f"Ошибка поиска хештега: {e}")
            return False
    
    def disconnect(self):
        """Отключение от эмулятора"""
        if self.driver:
            self.driver.quit()
            self.logger.info("Отключились от эмулятора")

# Пример использования
def main():
    bot = InstagramBot("Instagram_Bot_001")
    
    if bot.connect_to_emulator():
        # Авторизация
        if bot.login("your_username", "your_password"):
            # Создание поста
            bot.create_post(
                image_path="/path/to/image.jpg",
                caption="Мой новый пост!",
                hashtags=["instagram", "автопостинг", "бот"]
            )
            
            # Лайк постов
            bot.like_posts_by_hashtag("природа", count=5)
        
        bot.disconnect()

if __name__ == "__main__":
     main()
 ```

---

## 📊 Мониторинг и веб-панель управления

### Flask веб-панель

#### **Основное приложение Flask**
```python
from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_login import LoginManager, login_required, current_user
from flask_socketio import SocketIO, emit
import json
from datetime import datetime, timedelta
from typing import Dict, List
import threading
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
socketio = SocketIO(app, cors_allowed_origins="*")

# Инициализация менеджеров
db_manager = DatabaseManager("postgresql://user:password@localhost/instagram_automation")
proxy_manager = ProxyManager()
task_scheduler = TaskScheduler(db_manager)

class WebDashboard:
    def __init__(self):
        self.active_bots: Dict[str, SecureInstagramBot] = {}
        self.bot_status: Dict[str, Dict] = {}
        self.system_stats = {
            'total_accounts': 0,
            'active_accounts': 0,
            'posts_today': 0,
            'likes_today': 0,
            'errors_today': 0
        }
    
    def update_system_stats(self):
        """Обновление системной статистики"""
        today = datetime.utcnow().date()
        
        # Общее количество аккаунтов
        self.system_stats['total_accounts'] = db_manager.session.query(Account).count()
        
        # Активные аккаунты
        self.system_stats['active_accounts'] = db_manager.session.query(Account).filter(
            Account.status == AccountStatus.ACTIVE
        ).count()
        
        # Посты за сегодня
        self.system_stats['posts_today'] = db_manager.session.query(Post).filter(
            Post.published_time >= today
        ).count()
        
        # Лайки за сегодня
        self.system_stats['likes_today'] = db_manager.session.query(Activity).filter(
            Activity.activity_type == ActivityType.LIKE,
            Activity.created_at >= today
        ).count()
        
        # Ошибки за сегодня
        self.system_stats['errors_today'] = db_manager.session.query(Log).filter(
            Log.level == 'ERROR',
            Log.created_at >= today
        ).count()
    
    def get_bot_status(self, emulator_name: str) -> Dict:
        """Получение статуса бота"""
        if emulator_name in self.bot_status:
            return self.bot_status[emulator_name]
        
        return {
            'status': 'offline',
            'last_activity': None,
            'posts_today': 0,
            'likes_today': 0,
            'errors': 0
        }

dashboard = WebDashboard()

@app.route('/')
@login_required
def index():
    """Главная страница дашборда"""
    dashboard.update_system_stats()
    
    # Получение списка аккаунтов
    accounts = db_manager.session.query(Account).limit(10).all()
    
    # Получение последних логов
    recent_logs = db_manager.session.query(Log).order_by(
        Log.created_at.desc()
    ).limit(20).all()
    
    return render_template('dashboard.html', 
                         stats=dashboard.system_stats,
                         accounts=accounts,
                         logs=recent_logs)

@app.route('/accounts')
@login_required
def accounts():
    """Страница управления аккаунтами"""
    page = request.args.get('page', 1, type=int)
    per_page = 20
    
    accounts = db_manager.session.query(Account).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return render_template('accounts.html', accounts=accounts)

@app.route('/api/accounts', methods=['GET'])
@login_required
def api_get_accounts():
    """API для получения списка аккаунтов"""
    accounts = db_manager.session.query(Account).all()
    
    return jsonify([{
        'id': acc.id,
        'username': acc.username,
        'status': acc.status.value,
        'followers_count': acc.followers_count,
        'posts_count': acc.posts_count,
        'last_activity': acc.last_activity.isoformat() if acc.last_activity else None
    } for acc in accounts])

@app.route('/api/accounts/<int:account_id>/start', methods=['POST'])
@login_required
def api_start_account(account_id):
    """API для запуска бота для аккаунта"""
    account = db_manager.session.query(Account).get(account_id)
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    
    emulator_name = f"Instagram_Bot_{account_id:03d}"
    
    if emulator_name in dashboard.active_bots:
        return jsonify({'error': 'Bot already running'}), 400
    
    try:
        # Создание и запуск бота
        bot = SecureInstagramBot(emulator_name)
        
        if bot.connect_to_emulator():
            dashboard.active_bots[emulator_name] = bot
            dashboard.bot_status[emulator_name] = {
                'status': 'running',
                'started_at': datetime.utcnow().isoformat(),
                'account_id': account_id
            }
            
            # Обновление статуса аккаунта
            account.status = AccountStatus.ACTIVE
            db_manager.session.commit()
            
            # Отправка обновления через WebSocket
            socketio.emit('bot_status_update', {
                'emulator_name': emulator_name,
                'status': 'running',
                'account_id': account_id
            })
            
            return jsonify({'success': True, 'message': 'Bot started successfully'})
        else:
            return jsonify({'error': 'Failed to connect to emulator'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/accounts/<int:account_id>/stop', methods=['POST'])
@login_required
def api_stop_account(account_id):
    """API для остановки бота"""
    emulator_name = f"Instagram_Bot_{account_id:03d}"
    
    if emulator_name not in dashboard.active_bots:
        return jsonify({'error': 'Bot not running'}), 400
    
    try:
        bot = dashboard.active_bots[emulator_name]
        bot.disconnect()
        
        del dashboard.active_bots[emulator_name]
        dashboard.bot_status[emulator_name]['status'] = 'stopped'
        
        # Обновление статуса аккаунта
        account = db_manager.session.query(Account).get(account_id)
        account.status = AccountStatus.INACTIVE
        db_manager.session.commit()
        
        # Отправка обновления через WebSocket
        socketio.emit('bot_status_update', {
            'emulator_name': emulator_name,
            'status': 'stopped',
            'account_id': account_id
        })
        
        return jsonify({'success': True, 'message': 'Bot stopped successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats')
@login_required
def api_get_stats():
    """API для получения статистики"""
    dashboard.update_system_stats()
    return jsonify(dashboard.system_stats)

@app.route('/content')
@login_required
def content():
    """Страница управления контентом"""
    content_items = db_manager.session.query(Content).order_by(
        Content.created_at.desc()
    ).limit(50).all()
    
    return render_template('content.html', content_items=content_items)

@app.route('/api/content/upload', methods=['POST'])
@login_required
def api_upload_content():
    """API для загрузки контента"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    title = request.form.get('title', '')
    description = request.form.get('description', '')
    hashtags = request.form.get('hashtags', '').split(',')
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    try:
        # Сохранение файла
        filename = secure_filename(file.filename)
        file_path = os.path.join('content/images', filename)
        file.save(file_path)
        
        # Создание записи в БД
        content = db_manager.create_content(
            title=title,
            image_path=file_path,
            description=description,
            hashtags=[tag.strip() for tag in hashtags if tag.strip()]
        )
        
        return jsonify({
            'success': True,
            'content_id': content.id,
            'message': 'Content uploaded successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/scheduler')
@login_required
def scheduler():
    """Страница планировщика"""
    scheduled_posts = db_manager.session.query(Post).filter(
        Post.status == PostStatus.SCHEDULED
    ).order_by(Post.scheduled_time).all()
    
    return render_template('scheduler.html', scheduled_posts=scheduled_posts)

@app.route('/api/schedule_post', methods=['POST'])
@login_required
def api_schedule_post():
    """API для планирования поста"""
    data = request.get_json()
    
    try:
        account_id = data['account_id']
        content_id = data['content_id']
        scheduled_time = datetime.fromisoformat(data['scheduled_time'])
        caption = data.get('caption', '')
        
        post = db_manager.schedule_post(
            account_id=account_id,
            content_id=content_id,
            scheduled_time=scheduled_time,
            caption=caption
        )
        
        return jsonify({
            'success': True,
            'post_id': post.id,
            'message': 'Post scheduled successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@socketio.on('connect')
def handle_connect():
    """Обработка подключения WebSocket"""
    emit('connected', {'message': 'Connected to dashboard'})

@socketio.on('request_stats')
def handle_stats_request():
    """Обработка запроса статистики"""
    dashboard.update_system_stats()
    emit('stats_update', dashboard.system_stats)

# Фоновая задача для обновления статистики
def background_stats_update():
    """Фоновое обновление статистики"""
    while True:
        dashboard.update_system_stats()
        socketio.emit('stats_update', dashboard.system_stats)
        time.sleep(30)  # Обновление каждые 30 секунд

# Запуск фонового потока
stats_thread = threading.Thread(target=background_stats_update, daemon=True)
stats_thread.start()

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
```

#### **HTML шаблоны**

**templates/base.html**
```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}Instagram Automation Dashboard{% endblock %}</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- Socket.IO -->
    <script src="https://cdn.socket.io/4.5.0/socket.io.min.js"></script>
    
    <style>
        .sidebar {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .sidebar .nav-link {
            color: rgba(255,255,255,0.8);
            transition: all 0.3s;
        }
        .sidebar .nav-link:hover {
            color: white;
            background-color: rgba(255,255,255,0.1);
        }
        .sidebar .nav-link.active {
            color: white;
            background-color: rgba(255,255,255,0.2);
        }
        .stat-card {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            border-radius: 15px;
            transition: transform 0.3s;
        }
        .stat-card:hover {
            transform: translateY(-5px);
        }
        .bot-status-online {
            color: #28a745;
        }
        .bot-status-offline {
            color: #dc3545;
        }
        .bot-status-error {
            color: #ffc107;
        }
    </style>
</head>
<body>
    <div class="container-fluid">
        <div class="row">
            <!-- Sidebar -->
            <nav class="col-md-3 col-lg-2 d-md-block sidebar collapse">
                <div class="position-sticky pt-3">
                    <div class="text-center mb-4">
                        <h4 class="text-white">
                            <i class="fab fa-instagram"></i>
                            AutoPost
                        </h4>
                    </div>
                    
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a class="nav-link" href="{{ url_for('index') }}">
                                <i class="fas fa-tachometer-alt"></i>
                                Дашборд
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="{{ url_for('accounts') }}">
                                <i class="fas fa-users"></i>
                                Аккаунты
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="{{ url_for('content') }}">
                                <i class="fas fa-images"></i>
                                Контент
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="{{ url_for('scheduler') }}">
                                <i class="fas fa-calendar-alt"></i>
                                Планировщик
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#" onclick="showProxyManager()">
                                <i class="fas fa-shield-alt"></i>
                                Прокси
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#" onclick="showLogs()">
                                <i class="fas fa-list-alt"></i>
                                Логи
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>

            <!-- Main content -->
            <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">{% block page_title %}Дашборд{% endblock %}</h1>
                    <div class="btn-toolbar mb-2 mb-md-0">
                        <div class="btn-group me-2">
                            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="refreshData()">
                                <i class="fas fa-sync-alt"></i>
                                Обновить
                            </button>
                        </div>
                    </div>
                </div>

                {% block content %}{% endblock %}
            </main>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    
    <script>
        // WebSocket подключение
        const socket = io();
        
        socket.on('connect', function() {
            console.log('Connected to server');
        });
        
        socket.on('stats_update', function(stats) {
            updateStatsDisplay(stats);
        });
        
        socket.on('bot_status_update', function(data) {
            updateBotStatus(data);
        });
        
        function updateStatsDisplay(stats) {
            document.getElementById('total-accounts').textContent = stats.total_accounts;
            document.getElementById('active-accounts').textContent = stats.active_accounts;
            document.getElementById('posts-today').textContent = stats.posts_today;
            document.getElementById('likes-today').textContent = stats.likes_today;
            document.getElementById('errors-today').textContent = stats.errors_today;
        }
        
        function updateBotStatus(data) {
            const statusElement = document.getElementById(`bot-status-${data.account_id}`);
            if (statusElement) {
                statusElement.className = `bot-status-${data.status}`;
                statusElement.innerHTML = `<i class="fas fa-circle"></i> ${data.status}`;
            }
        }
        
        function refreshData() {
            socket.emit('request_stats');
            location.reload();
        }
        
        function startBot(accountId) {
            fetch(`/api/accounts/${accountId}/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('success', data.message);
                } else {
                    showAlert('danger', data.error);
                }
            })
            .catch(error => {
                showAlert('danger', 'Ошибка: ' + error.message);
            });
        }
        
        function stopBot(accountId) {
            fetch(`/api/accounts/${accountId}/stop`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('success', data.message);
                } else {
                    showAlert('danger', data.error);
                }
            })
            .catch(error => {
                showAlert('danger', 'Ошибка: ' + error.message);
            });
        }
        
        function showAlert(type, message) {
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
            alertDiv.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            
            const container = document.querySelector('main');
            container.insertBefore(alertDiv, container.firstChild);
            
            setTimeout(() => {
                alertDiv.remove();
            }, 5000);
        }
    </script>
    
    {% block scripts %}{% endblock %}
</body>
</html>
```

**templates/dashboard.html**
```html
{% extends "base.html" %}

{% block content %}
<!-- Статистические карточки -->
<div class="row mb-4">
    <div class="col-xl-3 col-md-6 mb-4">
        <div class="card stat-card">
            <div class="card-body">
                <div class="row no-gutters align-items-center">
                    <div class="col mr-2">
                        <div class="text-xs font-weight-bold text-uppercase mb-1">
                            Всего аккаунтов
                        </div>
                        <div class="h5 mb-0 font-weight-bold" id="total-accounts">
                            {{ stats.total_accounts }}
                        </div>
                    </div>
                    <div class="col-auto">
                        <i class="fas fa-users fa-2x"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-3 col-md-6 mb-4">
        <div class="card stat-card">
            <div class="card-body">
                <div class="row no-gutters align-items-center">
                    <div class="col mr-2">
                        <div class="text-xs font-weight-bold text-uppercase mb-1">
                            Активных аккаунтов
                        </div>
                        <div class="h5 mb-0 font-weight-bold" id="active-accounts">
                            {{ stats.active_accounts }}
                        </div>
                    </div>
                    <div class="col-auto">
                        <i class="fas fa-user-check fa-2x"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-3 col-md-6 mb-4">
        <div class="card stat-card">
            <div class="card-body">
                <div class="row no-gutters align-items-center">
                    <div class="col mr-2">
                        <div class="text-xs font-weight-bold text-uppercase mb-1">
                            Постов сегодня
                        </div>
                        <div class="h5 mb-0 font-weight-bold" id="posts-today">
                            {{ stats.posts_today }}
                        </div>
                    </div>
                    <div class="col-auto">
                        <i class="fas fa-image fa-2x"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-3 col-md-6 mb-4">
        <div class="card stat-card">
            <div class="card-body">
                <div class="row no-gutters align-items-center">
                    <div class="col mr-2">
                        <div class="text-xs font-weight-bold text-uppercase mb-1">
                            Лайков сегодня
                        </div>
                        <div class="h5 mb-0 font-weight-bold" id="likes-today">
                            {{ stats.likes_today }}
                        </div>
                    </div>
                    <div class="col-auto">
                        <i class="fas fa-heart fa-2x"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Графики активности -->
<div class="row mb-4">
    <div class="col-lg-8">
        <div class="card">
            <div class="card-header">
                <h6 class="m-0 font-weight-bold">Активность за неделю</h6>
            </div>
            <div class="card-body">
                <canvas id="activityChart"></canvas>
            </div>
        </div>
    </div>
    
    <div class="col-lg-4">
        <div class="card">
            <div class="card-header">
                <h6 class="m-0 font-weight-bold">Статус аккаунтов</h6>
            </div>
            <div class="card-body">
                <canvas id="statusChart"></canvas>
            </div>
        </div>
    </div>
</div>

<!-- Таблица аккаунтов -->
<div class="row">
    <div class="col-lg-8">
        <div class="card">
            <div class="card-header">
                <h6 class="m-0 font-weight-bold">Последние аккаунты</h6>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>Аккаунт</th>
                                <th>Статус</th>
                                <th>Подписчики</th>
                                <th>Посты</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {% for account in accounts %}
                            <tr>
                                <td>
                                    <strong>{{ account.username }}</strong><br>
                                    <small class="text-muted">{{ account.full_name }}</small>
                                </td>
                                <td>
                                    <span id="bot-status-{{ account.id }}" class="bot-status-{{ account.status.value }}">
                                        <i class="fas fa-circle"></i>
                                        {{ account.status.value }}
                                    </span>
                                </td>
                                <td>{{ account.followers_count or 0 }}</td>
                                <td>{{ account.posts_count or 0 }}</td>
                                <td>
                                    <button class="btn btn-sm btn-success" onclick="startBot({{ account.id }})">
                                        <i class="fas fa-play"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="stopBot({{ account.id }})">
                                        <i class="fas fa-stop"></i>
                                    </button>
                                </td>
                            </tr>
                            {% endfor %}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-lg-4">
        <div class="card">
            <div class="card-header">
                <h6 class="m-0 font-weight-bold">Последние логи</h6>
            </div>
            <div class="card-body" style="max-height: 400px; overflow-y: auto;">
                {% for log in logs %}
                <div class="mb-2 p-2 border-left border-{{ 'danger' if log.level == 'ERROR' else 'info' if log.level == 'INFO' else 'warning' }}">
                    <small class="text-muted">{{ log.created_at.strftime('%H:%M:%S') }}</small><br>
                    <strong>{{ log.level }}</strong>: {{ log.message }}
                </div>
                {% endfor %}
            </div>
        </div>
    </div>
</div>
{% endblock %}

{% block scripts %}
<script>
    // График активности
    const activityCtx = document.getElementById('activityChart').getContext('2d');
    const activityChart = new Chart(activityCtx, {
        type: 'line',
        data: {
            labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
            datasets: [{
                label: 'Посты',
                data: [12, 19, 3, 5, 2, 3, 7],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }, {
                label: 'Лайки',
                data: [65, 59, 80, 81, 56, 55, 40],
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // График статусов
    const statusCtx = document.getElementById('statusChart').getContext('2d');
    const statusChart = new Chart(statusCtx, {
        type: 'doughnut',
        data: {
            labels: ['Активные', 'Неактивные', 'Заблокированные'],
            datasets: [{
                data: [{{ stats.active_accounts }}, 
                       {{ stats.total_accounts - stats.active_accounts }}, 
                       0],
                backgroundColor: [
                    'rgb(75, 192, 192)',
                    'rgb(255, 205, 86)',
                    'rgb(255, 99, 132)'
                ]
            }]
        },
        options: {
            responsive: true
        }
    });
</script>
 {% endblock %}
 ```

---

## 🚀 Развертывание и масштабирование

### Docker контейнеризация

#### **Dockerfile для основного приложения**
```dockerfile
FROM python:3.9-slim

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    curl \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Создание рабочей директории
WORKDIR /app

# Копирование файлов зависимостей
COPY requirements.txt .

# Установка Python зависимостей
RUN pip install --no-cache-dir -r requirements.txt

# Копирование исходного кода
COPY . .

# Создание необходимых директорий
RUN mkdir -p logs content/images templates static

# Установка переменных окружения
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PYTHONPATH=/app

# Открытие порта
EXPOSE 5000

# Команда запуска
CMD ["python", "app.py"]
```

#### **docker-compose.yml**
```yaml
version: '3.8'

services:
  # Основное приложение
  instagram-automation:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/instagram_automation
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=your-super-secret-key-here
    depends_on:
      - db
      - redis
    volumes:
      - ./content:/app/content
      - ./logs:/app/logs
    networks:
      - instagram-network

  # База данных PostgreSQL
  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=instagram_automation
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - instagram-network

  # Redis для кеширования и очередей
  redis:
    image: redis:6-alpine
    networks:
      - instagram-network

  # Nginx для балансировки нагрузки
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - instagram-automation
    networks:
      - instagram-network

  # Мониторинг с Prometheus
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - instagram-network

  # Grafana для визуализации
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - instagram-network

volumes:
  postgres_data:
  grafana_data:

networks:
  instagram-network:
    driver: bridge
```

### Kubernetes развертывание

#### **kubernetes/namespace.yaml**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: instagram-automation
```

#### **kubernetes/deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: instagram-automation
  namespace: instagram-automation
spec:
  replicas: 3
  selector:
    matchLabels:
      app: instagram-automation
  template:
    metadata:
      labels:
        app: instagram-automation
    spec:
      containers:
      - name: instagram-automation
        image: instagram-automation:latest
        ports:
        - containerPort: 5000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: instagram-secrets
              key: database-url
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: instagram-secrets
              key: secret-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        volumeMounts:
        - name: content-storage
          mountPath: /app/content
        - name: logs-storage
          mountPath: /app/logs
      volumes:
      - name: content-storage
        persistentVolumeClaim:
          claimName: content-pvc
      - name: logs-storage
        persistentVolumeClaim:
          claimName: logs-pvc
```

#### **kubernetes/service.yaml**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: instagram-automation-service
  namespace: instagram-automation
spec:
  selector:
    app: instagram-automation
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5000
  type: LoadBalancer
```

### Автоматизация развертывания

#### **deploy.sh**
```bash
#!/bin/bash

# Скрипт автоматического развертывания Instagram Automation System

set -e

echo "🚀 Начинаем развертывание Instagram Automation System..."

# Проверка зависимостей
check_dependencies() {
    echo "📋 Проверка зависимостей..."
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker не установлен"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose не установлен"
        exit 1
    fi
    
    echo "✅ Все зависимости установлены"
}

# Создание необходимых директорий
create_directories() {
    echo "📁 Создание директорий..."
    
    mkdir -p {content/images,logs,ssl,backups}
    chmod 755 content/images logs
    
    echo "✅ Директории созданы"
}

# Генерация SSL сертификатов
generate_ssl() {
    echo "🔐 Генерация SSL сертификатов..."
    
    if [ ! -f ssl/server.crt ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/server.key \
            -out ssl/server.crt \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        
        echo "✅ SSL сертификаты созданы"
    else
        echo "✅ SSL сертификаты уже существуют"
    fi
}

# Настройка переменных окружения
setup_environment() {
    echo "⚙️ Настройка переменных окружения..."
    
    if [ ! -f .env ]; then
        cat > .env << EOF
# Database
DATABASE_URL=postgresql://postgres:password@db:5432/instagram_automation
POSTGRES_DB=instagram_automation
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$(openssl rand -base64 32)

# Redis
REDIS_URL=redis://redis:6379/0

# Application
SECRET_KEY=$(openssl rand -base64 32)
FLASK_ENV=production

# Security
JWT_SECRET_KEY=$(openssl rand -base64 32)

# Monitoring
PROMETHEUS_ENABLED=true
GRAFANA_ADMIN_PASSWORD=$(openssl rand -base64 16)
EOF
        echo "✅ Файл .env создан"
    else
        echo "✅ Файл .env уже существует"
    fi
}

# Сборка Docker образов
build_images() {
    echo "🔨 Сборка Docker образов..."
    
    docker-compose build --no-cache
    
    echo "✅ Docker образы собраны"
}

# Запуск сервисов
start_services() {
    echo "🚀 Запуск сервисов..."
    
    docker-compose up -d
    
    echo "⏳ Ожидание готовности сервисов..."
    sleep 30
    
    # Проверка статуса сервисов
    if docker-compose ps | grep -q "Up"; then
        echo "✅ Сервисы запущены успешно"
    else
        echo "❌ Ошибка запуска сервисов"
        docker-compose logs
        exit 1
    fi
}

# Инициализация базы данных
init_database() {
    echo "🗄️ Инициализация базы данных..."
    
    docker-compose exec instagram-automation python -c "
from database import DatabaseManager
db = DatabaseManager()
db.create_tables()
print('База данных инициализирована')
"
    
    echo "✅ База данных готова"
}

# Проверка работоспособности
health_check() {
    echo "🏥 Проверка работоспособности..."
    
    # Проверка веб-интерфейса
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        echo "✅ Веб-интерфейс доступен"
    else
        echo "❌ Веб-интерфейс недоступен"
    fi
    
    # Проверка базы данных
    if docker-compose exec db pg_isready -U postgres > /dev/null 2>&1; then
        echo "✅ База данных доступна"
    else
        echo "❌ База данных недоступна"
    fi
    
    # Проверка Redis
    if docker-compose exec redis redis-cli ping | grep -q PONG; then
        echo "✅ Redis доступен"
    else
        echo "❌ Redis недоступен"
    fi
}

# Создание резервной копии
create_backup() {
    echo "💾 Создание резервной копии..."
    
    BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
    BACKUP_DIR="backups/backup_$BACKUP_DATE"
    
    mkdir -p "$BACKUP_DIR"
    
    # Резервная копия базы данных
    docker-compose exec db pg_dump -U postgres instagram_automation > "$BACKUP_DIR/database.sql"
    
    # Резервная копия контента
    cp -r content "$BACKUP_DIR/"
    
    # Резервная копия конфигурации
    cp docker-compose.yml .env "$BACKUP_DIR/"
    
    echo "✅ Резервная копия создана: $BACKUP_DIR"
}

# Показ информации о развертывании
show_info() {
    echo ""
    echo "🎉 Развертывание завершено успешно!"
    echo ""
    echo "📊 Доступные сервисы:"
    echo "   • Веб-панель:     http://localhost:5000"
    echo "   • Grafana:        http://localhost:3000 (admin/admin)"
    echo "   • Prometheus:     http://localhost:9090"
    echo ""
    echo "🔧 Полезные команды:"
    echo "   • Просмотр логов: docker-compose logs -f"
    echo "   • Остановка:      docker-compose down"
    echo "   • Перезапуск:     docker-compose restart"
    echo ""
    echo "📁 Важные директории:"
    echo "   • Контент:        ./content/"
    echo "   • Логи:           ./logs/"
    echo "   • Резервные копии: ./backups/"
    echo ""
}

# Основная функция
main() {
    check_dependencies
    create_directories
    generate_ssl
    setup_environment
    build_images
    start_services
    init_database
    health_check
    create_backup
    show_info
}

# Обработка аргументов командной строки
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "backup")
        create_backup
        ;;
    "health")
        health_check
        ;;
    "stop")
        echo "🛑 Остановка сервисов..."
        docker-compose down
        echo "✅ Сервисы остановлены"
        ;;
    "restart")
        echo "🔄 Перезапуск сервисов..."
        docker-compose restart
        echo "✅ Сервисы перезапущены"
        ;;
    *)
        echo "Использование: $0 {deploy|backup|health|stop|restart}"
        exit 1
        ;;
esac
```

---

## ⚡ Оптимизация и производительность

### Оптимизация эмуляторов

#### **Скрипт оптимизации LDPlayer**
```python
import subprocess
import json
import time
from typing import List, Dict

class EmulatorOptimizer:
    def __init__(self):
        self.ldconsole_path = r"C:\LDPlayer\LDPlayer4.0\ldconsole.exe"
        
    def optimize_emulator_settings(self, emulator_name: str) -> bool:
        """Оптимизация настроек эмулятора"""
        try:
            # Настройки производительности
            settings = {
                'cpu': 2,           # 2 ядра CPU
                'memory': 2048,     # 2GB RAM
                'resolution': '720x1280',  # HD разрешение
                'dpi': 240,         # Плотность пикселей
                'fps': 30,          # 30 FPS
                'audio': False,     # Отключить звук
                'cleanmode': True,  # Режим очистки
                'vt': True,         # Виртуализация
                'imei': self.generate_imei(),
                'imsi': self.generate_imsi(),
                'simserial': self.generate_sim_serial(),
                'androidid': self.generate_android_id(),
                'mac': self.generate_mac(),
                'manufacturer': 'samsung',
                'model': 'SM-G973F',
                'pnumber': '+1234567890'
            }
            
            for key, value in settings.items():
                cmd = [
                    self.ldconsole_path, 'modify',
                    '--name', emulator_name,
                    f'--{key}', str(value)
                ]
                
                result = subprocess.run(cmd, capture_output=True, text=True)
                if result.returncode != 0:
                    print(f"Ошибка настройки {key}: {result.stderr}")
                    return False
                    
                time.sleep(0.5)  # Пауза между командами
            
            return True
            
        except Exception as e:
            print(f"Ошибка оптимизации эмулятора {emulator_name}: {e}")
            return False
    
    def optimize_system_performance(self) -> Dict[str, bool]:
        """Системная оптимизация"""
        results = {}
        
        try:
            # Отключение Windows Defender для папки эмулятора
            defender_cmd = [
                'powershell', '-Command',
                'Add-MpPreference -ExclusionPath "C:\\LDPlayer"'
            ]
            result = subprocess.run(defender_cmd, capture_output=True)
            results['defender_exclusion'] = result.returncode == 0
            
            # Настройка приоритета процессов
            priority_cmd = [
                'wmic', 'process', 'where', 'name="dnplayer.exe"',
                'CALL', 'setpriority', '128'  # High priority
            ]
            result = subprocess.run(priority_cmd, capture_output=True)
            results['process_priority'] = result.returncode == 0
            
            # Очистка временных файлов
            cleanup_paths = [
                r'C:\LDPlayer\vms\*\cache\*',
                r'C:\Users\%USERNAME%\AppData\Local\Temp\*'
            ]
            
            for path in cleanup_paths:
                cleanup_cmd = ['del', '/q', '/s', path]
                subprocess.run(cleanup_cmd, shell=True, capture_output=True)
            
            results['cleanup'] = True
            
        except Exception as e:
            print(f"Ошибка системной оптимизации: {e}")
            results['system_optimization'] = False
        
        return results
    
    def monitor_resource_usage(self, emulator_names: List[str]) -> Dict[str, Dict]:
        """Мониторинг использования ресурсов"""
        resource_data = {}
        
        for emulator_name in emulator_names:
            try:
                # Получение PID процесса эмулятора
                pid_cmd = [
                    'wmic', 'process', 'where',
                    f'CommandLine like "%{emulator_name}%"',
                    'get', 'ProcessId', '/value'
                ]
                
                result = subprocess.run(pid_cmd, capture_output=True, text=True)
                
                if result.returncode == 0:
                    # Парсинг PID
                    for line in result.stdout.split('\n'):
                        if 'ProcessId=' in line:
                            pid = line.split('=')[1].strip()
                            
                            # Получение статистики процесса
                            stats_cmd = [
                                'wmic', 'process', 'where', f'ProcessId={pid}',
                                'get', 'WorkingSetSize,PageFileUsage,CPUTime', '/value'
                            ]
                            
                            stats_result = subprocess.run(stats_cmd, capture_output=True, text=True)
                            
                            if stats_result.returncode == 0:
                                stats = {}
                                for stat_line in stats_result.stdout.split('\n'):
                                    if '=' in stat_line:
                                        key, value = stat_line.split('=', 1)
                                        stats[key.strip()] = value.strip()
                                
                                resource_data[emulator_name] = {
                                    'pid': pid,
                                    'memory_mb': int(stats.get('WorkingSetSize', 0)) // (1024 * 1024),
                                    'pagefile_mb': int(stats.get('PageFileUsage', 0)) // (1024 * 1024),
                                    'cpu_time': stats.get('CPUTime', '0')
                                }
                            
            except Exception as e:
                print(f"Ошибка мониторинга {emulator_name}: {e}")
                resource_data[emulator_name] = {'error': str(e)}
        
        return resource_data
    
    def auto_scale_emulators(self, target_count: int, max_memory_per_emulator: int = 2048) -> bool:
        """Автоматическое масштабирование эмуляторов"""
        try:
            # Получение доступной памяти системы
            memory_cmd = [
                'wmic', 'computersystem', 'get', 'TotalPhysicalMemory', '/value'
            ]
            
            result = subprocess.run(memory_cmd, capture_output=True, text=True)
            
            total_memory_bytes = 0
            for line in result.stdout.split('\n'):
                if 'TotalPhysicalMemory=' in line:
                    total_memory_bytes = int(line.split('=')[1].strip())
                    break
            
            total_memory_mb = total_memory_bytes // (1024 * 1024)
            available_memory_mb = total_memory_mb * 0.8  # 80% от общей памяти
            
            # Расчет максимального количества эмуляторов
            max_emulators = int(available_memory_mb // max_memory_per_emulator)
            
            if target_count > max_emulators:
                print(f"⚠️ Запрошено {target_count} эмуляторов, но система может поддержать только {max_emulators}")
                target_count = max_emulators
            
            # Получение списка существующих эмуляторов
            list_cmd = [self.ldconsole_path, 'list2']
            result = subprocess.run(list_cmd, capture_output=True, text=True)
            
            existing_emulators = []
            if result.returncode == 0:
                for line in result.stdout.split('\n'):
                    if 'Instagram_Bot_' in line:
                        existing_emulators.append(line.split(',')[1])
            
            current_count = len(existing_emulators)
            
            if current_count < target_count:
                # Создание недостающих эмуляторов
                for i in range(current_count, target_count):
                    emulator_name = f"Instagram_Bot_{i+1:03d}"
                    
                    # Создание эмулятора
                    create_cmd = [
                        self.ldconsole_path, 'add',
                        '--name', emulator_name
                    ]
                    
                    result = subprocess.run(create_cmd, capture_output=True, text=True)
                    
                    if result.returncode == 0:
                        # Оптимизация настроек
                        self.optimize_emulator_settings(emulator_name)
                        print(f"✅ Создан и оптимизирован эмулятор: {emulator_name}")
                    else:
                        print(f"❌ Ошибка создания эмулятора {emulator_name}: {result.stderr}")
                        
                    time.sleep(2)  # Пауза между созданием эмуляторов
            
            elif current_count > target_count:
                # Удаление лишних эмуляторов
                for i in range(target_count, current_count):
                    emulator_name = existing_emulators[i]
                    
                    # Остановка эмулятора
                    quit_cmd = [self.ldconsole_path, 'quit', '--name', emulator_name]
                    subprocess.run(quit_cmd, capture_output=True)
                    
                    # Удаление эмулятора
                    remove_cmd = [self.ldconsole_path, 'remove', '--name', emulator_name]
                    result = subprocess.run(remove_cmd, capture_output=True, text=True)
                    
                    if result.returncode == 0:
                        print(f"✅ Удален эмулятор: {emulator_name}")
                    else:
                        print(f"❌ Ошибка удаления эмулятора {emulator_name}: {result.stderr}")
            
            print(f"🎯 Целевое количество эмуляторов: {target_count}")
            return True
            
        except Exception as e:
            print(f"Ошибка автомасштабирования: {e}")
            return False
    
    def generate_imei(self) -> str:
        """Генерация уникального IMEI"""
        import random
        
        # TAC (Type Allocation Code) для Samsung
        tac = "35699309"
        
        # Серийный номер (6 цифр)
        serial = f"{random.randint(100000, 999999)}"
        
        # Расчет контрольной суммы по алгоритму Luhn
        imei_without_checksum = tac + serial
        checksum = self.calculate_luhn_checksum(imei_without_checksum)
        
        return imei_without_checksum + str(checksum)
    
    def calculate_luhn_checksum(self, number: str) -> int:
        """Расчет контрольной суммы по алгоритму Luhn"""
        digits = [int(d) for d in number]
        
        for i in range(len(digits) - 2, -1, -2):
            digits[i] *= 2
            if digits[i] > 9:
                digits[i] -= 9
        
        total = sum(digits)
        return (10 - (total % 10)) % 10
    
    def generate_imsi(self) -> str:
        """Генерация IMSI"""
        import random
        
        # MCC (Mobile Country Code) - USA
        mcc = "310"
        
        # MNC (Mobile Network Code) - T-Mobile
        mnc = "260"
        
        # MSIN (Mobile Station Identification Number)
        msin = f"{random.randint(1000000000, 9999999999)}"
        
        return mcc + mnc + msin
    
    def generate_sim_serial(self) -> str:
        """Генерация серийного номера SIM"""
        import random
        return f"{random.randint(10000000000000000000, 99999999999999999999)}"
    
    def generate_android_id(self) -> str:
        """Генерация Android ID"""
        import random
        return f"{random.randint(1000000000000000, 9999999999999999):016x}"
    
    def generate_mac(self) -> str:
        """Генерация MAC адреса"""
        import random
        
        # Первый байт для локально администрируемого адреса
        mac = [0x02]
        
        # Остальные 5 байтов
        for _ in range(5):
            mac.append(random.randint(0x00, 0xff))
        
        return ':'.join(f'{b:02x}' for b in mac)

# Пример использования
if __name__ == "__main__":
    optimizer = EmulatorOptimizer()
    
    # Системная оптимизация
    print("🔧 Выполнение системной оптимизации...")
    system_results = optimizer.optimize_system_performance()
    
    for operation, success in system_results.items():
        status = "✅" if success else "❌"
        print(f"{status} {operation}")
    
    # Автомасштабирование
    print("\n📈 Автомасштабирование эмуляторов...")
    optimizer.auto_scale_emulators(target_count=10)
    
    # Мониторинг ресурсов
    print("\n📊 Мониторинг ресурсов...")
    emulator_names = [f"Instagram_Bot_{i:03d}" for i in range(1, 11)]
    resources = optimizer.monitor_resource_usage(emulator_names)
    
    for emulator, stats in resources.items():
        if 'error' not in stats:
            print(f"{emulator}: {stats['memory_mb']}MB RAM, PID: {stats['pid']}")
        else:
            print(f"{emulator}: Ошибка - {stats['error']}")
```

### Мониторинг производительности

#### **Система метрик Prometheus**
```python
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import time
import threading
from typing import Dict, Any

class MetricsCollector:
    def __init__(self):
        # Счетчики
        self.posts_created = Counter('instagram_posts_created_total', 'Total posts created')
        self.likes_performed = Counter('instagram_likes_performed_total', 'Total likes performed')
        self.errors_occurred = Counter('instagram_errors_total', 'Total errors occurred', ['error_type'])
        
        # Гистограммы для времени выполнения
        self.post_creation_time = Histogram('instagram_post_creation_seconds', 'Time spent creating posts')
        self.like_action_time = Histogram('instagram_like_action_seconds', 'Time spent liking posts')
        self.login_time = Histogram('instagram_login_seconds', 'Time spent logging in')
        
        # Датчики для текущего состояния
        self.active_bots = Gauge('instagram_active_bots', 'Number of active bots')
        self.emulator_memory_usage = Gauge('emulator_memory_usage_mb', 'Memory usage per emulator', ['emulator_name'])
        self.emulator_cpu_usage = Gauge('emulator_cpu_usage_percent', 'CPU usage per emulator', ['emulator_name'])
        
        # Запуск HTTP сервера для метрик
        start_http_server(8000)
        
        # Запуск фонового сбора метрик
        self.start_background_collection()
    
    def record_post_created(self):
        """Записать создание поста"""
        self.posts_created.inc()
    
    def record_like_performed(self):
        """Записать выполнение лайка"""
        self.likes_performed.inc()
    
    def record_error(self, error_type: str):
        """Записать ошибку"""
        self.errors_occurred.labels(error_type=error_type).inc()
    
    def time_post_creation(self):
        """Контекстный менеджер для измерения времени создания поста"""
        return self.post_creation_time.time()
    
    def time_like_action(self):
        """Контекстный менеджер для измерения времени лайка"""
        return self.like_action_time.time()
    
    def time_login(self):
        """Контекстный менеджер для измерения времени входа"""
        return self.login_time.time()
    
    def update_active_bots(self, count: int):
        """Обновить количество активных ботов"""
        self.active_bots.set(count)
    
    def update_emulator_metrics(self, emulator_name: str, memory_mb: float, cpu_percent: float):
        """Обновить метрики эмулятора"""
        self.emulator_memory_usage.labels(emulator_name=emulator_name).set(memory_mb)
        self.emulator_cpu_usage.labels(emulator_name=emulator_name).set(cpu_percent)
    
    def start_background_collection(self):
        """Запуск фонового сбора метрик"""
        def collect_system_metrics():
            while True:
                try:
                    # Здесь можно добавить сбор системных метрик
                    # Например, использование диска, сетевая активность и т.д.
                    time.sleep(30)
                except Exception as e:
                    print(f"Ошибка сбора метрик: {e}")
        
        thread = threading.Thread(target=collect_system_metrics, daemon=True)
        thread.start()

# Глобальный экземпляр коллектора метрик
metrics = MetricsCollector()
```

---

## 📋 Заключение и рекомендации

### Итоговая архитектура системы

Данное руководство представляет полную архитектуру системы автопостинга в Instagram, включающую:

#### **🏗️ Основные компоненты:**
1. **Эмуляторная ферма** - LDPlayer эмуляторы для масштабирования
2. **Система автоматизации** - Appium + Python для управления действиями
3. **База данных** - PostgreSQL для хранения данных аккаунтов и контента
4. **Прокси-система** - Ротация IP для обхода блокировок
5. **Веб-панель** - Flask интерфейс для управления и мониторинга
6. **Система безопасности** - Антидетект и имитация человеческого поведения

#### **⚡ Ключевые возможности:**
- Управление 100+ Instagram аккаунтами
- Автоматическое планирование и публикация постов
- Система лайков и взаимодействий
- Мониторинг в реальном времени
- Масштабируемая архитектура
- Система резервного копирования

### Рекомендации по внедрению

#### **🚀 Поэтапное развертывание:**

**Этап 1: Тестовая среда (1-5 аккаунтов)**
```bash
# Минимальная конфигурация для тестирования
- 1 сервер: 16GB RAM, 8 CPU cores
- 5 LDPlayer эмуляторов
- Базовая веб-панель
- Простая система прокси
```

**Этап 2: Пилотный проект (10-20 аккаунтов)**
```bash
# Расширенная конфигурация
- 1 основной сервер + 1 VPS для эмуляторов
- 20 эмуляторов с оптимизацией
- Полная веб-панель с мониторингом
- Профессиональные прокси
```

**Этап 3: Полномасштабное развертывание (50-100+ аккаунтов)**
```bash
# Производственная конфигурация
- Кластер серверов с балансировкой нагрузки
- Kubernetes оркестрация
- Система мониторинга Prometheus + Grafana
- Высококачественные прокси с ротацией
```

#### **🔒 Критически важные аспекты безопасности:**

1. **Качество прокси** - Используйте только мобильные/резидентные прокси
2. **Человекоподобное поведение** - Случайные задержки и вариативность действий
3. **Лимиты активности** - Строгое соблюдение ограничений Instagram
4. **Уникальные отпечатки** - Разные IMEI, Android ID для каждого эмулятора
5. **Мониторинг блокировок** - Автоматическое обнаружение и реагирование

#### **📊 Метрики успеха:**

- **Время безотказной работы**: >99%
- **Скорость обработки**: <30 секунд на пост
- **Процент успешных действий**: >95%
- **Количество блокировок**: <1% в месяц

#### **💡 Дополнительные возможности для развития:**

1. **AI-генерация контента** - Интеграция с GPT для создания подписей
2. **Аналитика эффективности** - Отслеживание метрик вовлеченности
3. **Автоматическое A/B тестирование** - Оптимизация времени публикации
4. **Интеграция с CRM** - Синхронизация с системами управления клиентами
5. **Мобильное приложение** - Управление системой с мобильных устройств

### Техническая поддержка и обслуживание

#### **🔧 Регулярное обслуживание:**
- Еженедельное обновление прокси
- Ежемесячная оптимизация эмуляторов
- Квартальное обновление системы безопасности
- Постоянный мониторинг логов и метрик

#### **📞 Поддержка и сообщество:**
- Документация и FAQ
- Система тикетов для технической поддержки
- Сообщество пользователей для обмена опытом
- Регулярные обновления и патчи безопасности

---

**⚠️ Важное предупреждение:**
Данная система предназначена исключительно для образовательных целей и легального использования в соответствии с правилами Instagram и местным законодательством. Пользователи несут полную ответственность за соблюдение всех применимых законов и правил платформы.

**📄 Лицензия:**
Этот проект распространяется под лицензией MIT. Подробности в файле LICENSE.

**🤝 Вклад в проект:**
Мы приветствуем вклад сообщества! Пожалуйста, ознакомьтесь с руководством по внесению изменений в файле CONTRIBUTING.md.

---

*Последнее обновление: $(date +%Y-%m-%d)*
*Версия документации: 1.0.0*

### Система управления задачами

```python
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Callable
from enum import Enum
import asyncio
import json
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class TaskStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TaskType(Enum):
    POST = "post"
    LIKE = "like"
    FOLLOW = "follow"
    COMMENT = "comment"
    STORY = "story"

@dataclass
class PostData:
    image_path: str
    caption: str
    hashtags: List[str] = field(default_factory=list)
    location: Optional[str] = None

@dataclass
class LikeData:
    hashtag: str
    count: int = 10
    max_likes_per_hour: int = 30

class Task(Base):
    __tablename__ = 'tasks'
    
    id = Column(Integer, primary_key=True)
    account_id = Column(Integer, nullable=False)
    task_type = Column(String(50), nullable=False)
    status = Column(String(50), default=TaskStatus.PENDING.value)
    scheduled_time = Column(DateTime, nullable=False)
    created_time = Column(DateTime, default=datetime.utcnow)
    completed_time = Column(DateTime, nullable=True)
    task_data = Column(Text, nullable=False)  # JSON
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)

class TaskScheduler:
    def __init__(self, database_url: str):
        self.engine = create_engine(database_url)
        Base.metadata.create_all(self.engine)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()
        
        self.running_tasks: Dict[int, asyncio.Task] = {}
        self.bot_pool: Dict[int, InstagramBot] = {}
        
    def schedule_post(self, account_id: int, post_data: PostData, 
                     scheduled_time: datetime) -> int:
        """Планирование поста"""
        task = Task(
            account_id=account_id,
            task_type=TaskType.POST.value,
            scheduled_time=scheduled_time,
            task_data=json.dumps({
                'image_path': post_data.image_path,
                'caption': post_data.caption,
                'hashtags': post_data.hashtags,
                'location': post_data.location
            })
        )
        
        self.session.add(task)
        self.session.commit()
        
        return task.id
    
    def schedule_likes(self, account_id: int, like_data: LikeData,
                      scheduled_time: datetime) -> int:
        """Планирование лайков"""
        task = Task(
            account_id=account_id,
            task_type=TaskType.LIKE.value,
            scheduled_time=scheduled_time,
            task_data=json.dumps({
                'hashtag': like_data.hashtag,
                'count': like_data.count,
                'max_likes_per_hour': like_data.max_likes_per_hour
            })
        )
        
        self.session.add(task)
        self.session.commit()
        
        return task.id
    
    async def run_scheduler(self):
        """Основной цикл планировщика"""
        while True:
            try:
                # Получение задач для выполнения
                pending_tasks = self.session.query(Task).filter(
                    Task.status == TaskStatus.PENDING.value,
                    Task.scheduled_time <= datetime.utcnow()
                ).all()
                
                for task in pending_tasks:
                    if task.id not in self.running_tasks:
                        # Запуск задачи
                        asyncio_task = asyncio.create_task(
                            self.execute_task(task)
                        )
                        self.running_tasks[task.id] = asyncio_task
                
                # Очистка завершенных задач
                completed_task_ids = []
                for task_id, asyncio_task in self.running_tasks.items():
                    if asyncio_task.done():
                        completed_task_ids.append(task_id)
                
                for task_id in completed_task_ids:
                    del self.running_tasks[task_id]
                
                await asyncio.sleep(30)  # Проверка каждые 30 секунд
                
            except Exception as e:
                print(f"Ошибка в планировщике: {e}")
                await asyncio.sleep(60)
    
    async def execute_task(self, task: Task):
        """Выполнение задачи"""
        try:
            # Обновление статуса
            task.status = TaskStatus.RUNNING.value
            self.session.commit()
            
            # Получение бота для аккаунта
            bot = await self.get_bot_for_account(task.account_id)
            if not bot:
                raise Exception("Не удалось получить бота для аккаунта")
            
            # Выполнение задачи в зависимости от типа
            success = False
            if task.task_type == TaskType.POST.value:
                success = await self.execute_post_task(bot, task)
            elif task.task_type == TaskType.LIKE.value:
                success = await self.execute_like_task(bot, task)
            
            # Обновление статуса
            if success:
                task.status = TaskStatus.COMPLETED.value
                task.completed_time = datetime.utcnow()
            else:
                await self.handle_task_failure(task)
            
            self.session.commit()
            
        except Exception as e:
            await self.handle_task_error(task, str(e))
    
    async def execute_post_task(self, bot: InstagramBot, task: Task) -> bool:
        """Выполнение задачи постинга"""
        try:
            task_data = json.loads(task.task_data)
            
            return bot.create_post(
                image_path=task_data['image_path'],
                caption=task_data['caption'],
                hashtags=task_data.get('hashtags', [])
            )
            
        except Exception as e:
            print(f"Ошибка выполнения поста: {e}")
            return False
    
    async def execute_like_task(self, bot: InstagramBot, task: Task) -> bool:
        """Выполнение задачи лайков"""
        try:
            task_data = json.loads(task.task_data)
            
            liked_count = bot.like_posts_by_hashtag(
                hashtag=task_data['hashtag'],
                count=task_data['count']
            )
            
            return liked_count > 0
            
        except Exception as e:
            print(f"Ошибка выполнения лайков: {e}")
            return False
    
    async def get_bot_for_account(self, account_id: int) -> Optional[InstagramBot]:
        """Получение бота для аккаунта"""
        if account_id in self.bot_pool:
            return self.bot_pool[account_id]
        
        # Создание нового бота
        # Здесь должна быть логика получения данных аккаунта из БД
        # и создания соответствующего бота
        
        return None
    
    async def handle_task_failure(self, task: Task):
        """Обработка неудачного выполнения задачи"""
        task.retry_count += 1
        
        if task.retry_count < task.max_retries:
            # Повторная попытка через некоторое время
            task.status = TaskStatus.PENDING.value
            task.scheduled_time = datetime.utcnow() + timedelta(minutes=30)
        else:
            task.status = TaskStatus.FAILED.value
            task.completed_time = datetime.utcnow()
    
    async def handle_task_error(self, task: Task, error_message: str):
        """Обработка ошибки выполнения задачи"""
        task.error_message = error_message
        await self.handle_task_failure(task)
        self.session.commit()

# Пример использования планировщика
async def main():
    scheduler = TaskScheduler("postgresql://user:password@localhost/instagram_bot")
    
    # Планирование поста
    post_data = PostData(
        image_path="/content/images/post1.jpg",
        caption="Привет, мир!",
        hashtags=["hello", "world", "instagram"]
    )
    
    scheduled_time = datetime.utcnow() + timedelta(hours=1)
    task_id = scheduler.schedule_post(1, post_data, scheduled_time)
    print(f"Запланирован пост с ID: {task_id}")
    
    # Запуск планировщика
    await scheduler.run_scheduler()

if __name__ == "__main__":
    asyncio.run(main())
```

---

## 🗄️ База данных и управление аккаунтами

### Схема базы данных

```sql
-- Создание базы данных
CREATE DATABASE instagram_automation;
USE instagram_automation;

-- Таблица аккаунтов
CREATE TABLE accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    full_name VARCHAR(255),
    bio TEXT,
    profile_picture_url VARCHAR(500),
    
    -- Статус аккаунта
    status ENUM('active', 'suspended', 'banned', 'inactive') DEFAULT 'active',
    is_verified BOOLEAN DEFAULT FALSE,
    is_private BOOLEAN DEFAULT FALSE,
    
    -- Статистика
    followers_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    posts_count INT DEFAULT 0,
    
    -- Настройки автоматизации
    auto_posting_enabled BOOLEAN DEFAULT TRUE,
    auto_liking_enabled BOOLEAN DEFAULT TRUE,
    auto_following_enabled BOOLEAN DEFAULT FALSE,
    
    -- Лимиты активности
    daily_posts_limit INT DEFAULT 3,
    daily_likes_limit INT DEFAULT 100,
    daily_follows_limit INT DEFAULT 50,
    daily_comments_limit INT DEFAULT 20,
    
    -- Технические данные
    emulator_name VARCHAR(255),
    proxy_id INT,
    last_activity TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_status (status),
    INDEX idx_emulator (emulator_name)
);

-- Таблица прокси
CREATE TABLE proxies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('http', 'https', 'socks4', 'socks5') NOT NULL,
    host VARCHAR(255) NOT NULL,
    port INT NOT NULL,
    username VARCHAR(255),
    password VARCHAR(255),
    country VARCHAR(2),
    city VARCHAR(100),
    
    -- Статус прокси
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    last_check TIMESTAMP,
    response_time INT, -- в миллисекундах
    success_rate DECIMAL(5,2) DEFAULT 100.00,
    
    -- Использование
    accounts_count INT DEFAULT 0,
    max_accounts INT DEFAULT 5,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_proxy (host, port),
    INDEX idx_status (status),
    INDEX idx_country (country)
);

-- Таблица контента
CREATE TABLE content (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_path VARCHAR(500) NOT NULL,
    image_url VARCHAR(500),
    
    -- Метаданные изображения
    image_width INT,
    image_height INT,
    image_size INT, -- в байтах
    image_format VARCHAR(10),
    
    -- Категоризация
    category VARCHAR(100),
    tags JSON,
    hashtags JSON,
    
    -- Статус
    status ENUM('draft', 'ready', 'published', 'archived') DEFAULT 'draft',
    
    -- Планирование
    scheduled_accounts JSON, -- массив ID аккаунтов
    publish_times JSON, -- массив времен публикации
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_category (category)
);

-- Таблица постов
CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    account_id INT NOT NULL,
    content_id INT,
    
    -- Данные поста
    caption TEXT,
    hashtags JSON,
    location VARCHAR(255),
    
    -- Instagram данные
    instagram_post_id VARCHAR(255),
    instagram_url VARCHAR(500),
    
    -- Статистика
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    reach INT DEFAULT 0,
    impressions INT DEFAULT 0,
    
    -- Статус
    status ENUM('scheduled', 'published', 'failed', 'deleted') DEFAULT 'scheduled',
    error_message TEXT,
    
    -- Временные метки
    scheduled_time TIMESTAMP,
    published_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE SET NULL,
    
    INDEX idx_account_id (account_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_time (scheduled_time),
    INDEX idx_published_time (published_time)
);

-- Таблица активности (лайки, комментарии, подписки)
CREATE TABLE activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    account_id INT NOT NULL,
    activity_type ENUM('like', 'comment', 'follow', 'unfollow', 'view_story') NOT NULL,
    
    -- Цель активности
    target_username VARCHAR(255),
    target_post_id VARCHAR(255),
    target_url VARCHAR(500),
    
    -- Данные активности
    comment_text TEXT,
    hashtag VARCHAR(255),
    
    -- Результат
    status ENUM('completed', 'failed', 'skipped') DEFAULT 'completed',
    error_message TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    
    INDEX idx_account_id (account_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at),
    INDEX idx_hashtag (hashtag)
);

-- Таблица настроек
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category VARCHAR(100) NOT NULL,
    key_name VARCHAR(100) NOT NULL,
    value TEXT,
    description TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_setting (category, key_name)
);

-- Таблица логов
CREATE TABLE logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    level ENUM('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL') NOT NULL,
    logger_name VARCHAR(255),
    message TEXT NOT NULL,
    
    -- Контекст
    account_id INT,
    emulator_name VARCHAR(255),
    task_id INT,
    
    -- Дополнительные данные
    extra_data JSON,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_level (level),
    INDEX idx_account_id (account_id),
    INDEX idx_created_at (created_at),
    INDEX idx_emulator_name (emulator_name)
);

-- Вставка начальных настроек
INSERT INTO settings (category, key_name, value, description) VALUES
('automation', 'max_daily_posts_per_account', '3', 'Максимальное количество постов в день на аккаунт'),
('automation', 'max_daily_likes_per_account', '100', 'Максимальное количество лайков в день на аккаунт'),
('automation', 'min_delay_between_actions', '30', 'Минимальная задержка между действиями (секунды)'),
('automation', 'max_delay_between_actions', '300', 'Максимальная задержка между действиями (секунды)'),
('system', 'max_concurrent_emulators', '20', 'Максимальное количество одновременно работающих эмуляторов'),
('system', 'emulator_restart_interval', '86400', 'Интервал перезапуска эмуляторов (секунды)'),
('proxy', 'rotation_interval', '3600', 'Интервал ротации прокси (секунды)'),
('proxy', 'max_accounts_per_proxy', '5', 'Максимальное количество аккаунтов на прокси');
```

### Python модели для работы с БД

```python
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Text, JSON, Enum, DECIMAL, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import enum
import json

Base = declarative_base()

class AccountStatus(enum.Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    BANNED = "banned"
    INACTIVE = "inactive"

class ProxyStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    BANNED = "banned"

class ContentStatus(enum.Enum):
    DRAFT = "draft"
    READY = "ready"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class PostStatus(enum.Enum):
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    FAILED = "failed"
    DELETED = "deleted"

class ActivityType(enum.Enum):
    LIKE = "like"
    COMMENT = "comment"
    FOLLOW = "follow"
    UNFOLLOW = "unfollow"
    VIEW_STORY = "view_story"

class Account(Base):
    __tablename__ = 'accounts'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    email = Column(String(255))
    phone = Column(String(50))
    full_name = Column(String(255))
    bio = Column(Text)
    profile_picture_url = Column(String(500))
    
    # Статус аккаунта
    status = Column(Enum(AccountStatus), default=AccountStatus.ACTIVE)
    is_verified = Column(Boolean, default=False)
    is_private = Column(Boolean, default=False)
    
    # Статистика
    followers_count = Column(Integer, default=0)
    following_count = Column(Integer, default=0)
    posts_count = Column(Integer, default=0)
    
    # Настройки автоматизации
    auto_posting_enabled = Column(Boolean, default=True)
    auto_liking_enabled = Column(Boolean, default=True)
    auto_following_enabled = Column(Boolean, default=False)
    
    # Лимиты активности
    daily_posts_limit = Column(Integer, default=3)
    daily_likes_limit = Column(Integer, default=100)
    daily_follows_limit = Column(Integer, default=50)
    daily_comments_limit = Column(Integer, default=20)
    
    # Технические данные
    emulator_name = Column(String(255))
    proxy_id = Column(Integer, ForeignKey('proxies.id'))
    last_activity = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Связи
    proxy = relationship("Proxy", back_populates="accounts")
    posts = relationship("Post", back_populates="account")
    activities = relationship("Activity", back_populates="account")

class Proxy(Base):
    __tablename__ = 'proxies'
    
    id = Column(Integer, primary_key=True)
    type = Column(String(10), nullable=False)
    host = Column(String(255), nullable=False)
    port = Column(Integer, nullable=False)
    username = Column(String(255))
    password = Column(String(255))
    country = Column(String(2))
    city = Column(String(100))
    
    # Статус прокси
    status = Column(Enum(ProxyStatus), default=ProxyStatus.ACTIVE)
    last_check = Column(DateTime)
    response_time = Column(Integer)  # в миллисекундах
    success_rate = Column(DECIMAL(5, 2), default=100.00)
    
    # Использование
    accounts_count = Column(Integer, default=0)
    max_accounts = Column(Integer, default=5)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Связи
    accounts = relationship("Account", back_populates="proxy")

class Content(Base):
    __tablename__ = 'content'
    
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    image_path = Column(String(500), nullable=False)
    image_url = Column(String(500))
    
    # Метаданные изображения
    image_width = Column(Integer)
    image_height = Column(Integer)
    image_size = Column(Integer)  # в байтах
    image_format = Column(String(10))
    
    # Категоризация
    category = Column(String(100))
    tags = Column(JSON)
    hashtags = Column(JSON)
    
    # Статус
    status = Column(Enum(ContentStatus), default=ContentStatus.DRAFT)
    
    # Планирование
    scheduled_accounts = Column(JSON)  # массив ID аккаунтов
    publish_times = Column(JSON)  # массив времен публикации
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Связи
    posts = relationship("Post", back_populates="content")

class Post(Base):
    __tablename__ = 'posts'
    
    id = Column(Integer, primary_key=True)
    account_id = Column(Integer, ForeignKey('accounts.id'), nullable=False)
    content_id = Column(Integer, ForeignKey('content.id'))
    
    # Данные поста
    caption = Column(Text)
    hashtags = Column(JSON)
    location = Column(String(255))
    
    # Instagram данные
    instagram_post_id = Column(String(255))
    instagram_url = Column(String(500))
    
    # Статистика
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    shares_count = Column(Integer, default=0)
    reach = Column(Integer, default=0)
    impressions = Column(Integer, default=0)
    
    # Статус
    status = Column(Enum(PostStatus), default=PostStatus.SCHEDULED)
    error_message = Column(Text)
    
    # Временные метки
    scheduled_time = Column(DateTime)
    published_time = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Связи
    account = relationship("Account", back_populates="posts")
    content = relationship("Content", back_populates="posts")

class Activity(Base):
    __tablename__ = 'activities'
    
    id = Column(Integer, primary_key=True)
    account_id = Column(Integer, ForeignKey('accounts.id'), nullable=False)
    activity_type = Column(Enum(ActivityType), nullable=False)
    
    # Цель активности
    target_username = Column(String(255))
    target_post_id = Column(String(255))
    target_url = Column(String(500))
    
    # Данные активности
    comment_text = Column(Text)
    hashtag = Column(String(255))
    
    # Результат
    status = Column(String(20), default='completed')
    error_message = Column(Text)
    
    created_at = Column(DateTime, default=func.now())
    
    # Связи
    account = relationship("Account", back_populates="activities")

class DatabaseManager:
    def __init__(self, database_url: str):
        self.engine = create_engine(database_url, echo=False)
        Base.metadata.create_all(self.engine)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()
    
    def create_account(self, username: str, password: str, **kwargs) -> Account:
        """Создание нового аккаунта"""
        account = Account(
            username=username,
            password=password,
            **kwargs
        )
        
        self.session.add(account)
        self.session.commit()
        return account
    
    def get_account(self, account_id: int) -> Optional[Account]:
        """Получение аккаунта по ID"""
        return self.session.query(Account).filter(Account.id == account_id).first()
    
    def get_account_by_username(self, username: str) -> Optional[Account]:
        """Получение аккаунта по имени пользователя"""
        return self.session.query(Account).filter(Account.username == username).first()
    
    def get_active_accounts(self) -> List[Account]:
        """Получение всех активных аккаунтов"""
        return self.session.query(Account).filter(
            Account.status == AccountStatus.ACTIVE
        ).all()
    
    def assign_proxy_to_account(self, account_id: int, proxy_id: int) -> bool:
        """Назначение прокси аккаунту"""
        account = self.get_account(account_id)
        proxy = self.session.query(Proxy).filter(Proxy.id == proxy_id).first()
        
        if not account or not proxy:
            return False
        
        if proxy.accounts_count >= proxy.max_accounts:
            return False
        
        # Освобождение старого прокси
        if account.proxy_id:
            old_proxy = self.session.query(Proxy).filter(Proxy.id == account.proxy_id).first()
            if old_proxy:
                old_proxy.accounts_count -= 1
        
        # Назначение нового прокси
        account.proxy_id = proxy_id
        proxy.accounts_count += 1
        
        self.session.commit()
        return True
    
    def create_content(self, title: str, image_path: str, **kwargs) -> Content:
        """Создание контента"""
        content = Content(
            title=title,
            image_path=image_path,
            **kwargs
        )
        
        self.session.add(content)
        self.session.commit()
        return content
    
    def schedule_post(self, account_id: int, content_id: int, 
                     scheduled_time: datetime, **kwargs) -> Post:
        """Планирование поста"""
        post = Post(
            account_id=account_id,
            content_id=content_id,
            scheduled_time=scheduled_time,
            **kwargs
        )
        
        self.session.add(post)
        self.session.commit()
        return post
    
    def get_scheduled_posts(self, limit_time: datetime = None) -> List[Post]:
        """Получение запланированных постов"""
        if limit_time is None:
            limit_time = datetime.utcnow()
        
        return self.session.query(Post).filter(
            Post.status == PostStatus.SCHEDULED,
            Post.scheduled_time <= limit_time
        ).all()
    
    def update_post_status(self, post_id: int, status: PostStatus, 
                          error_message: str = None):
        """Обновление статуса поста"""
        post = self.session.query(Post).filter(Post.id == post_id).first()
        if post:
            post.status = status
            if error_message:
                post.error_message = error_message
            if status == PostStatus.PUBLISHED:
                post.published_time = datetime.utcnow()
            
            self.session.commit()
    
    def log_activity(self, account_id: int, activity_type: ActivityType, **kwargs):
        """Логирование активности"""
        activity = Activity(
            account_id=account_id,
            activity_type=activity_type,
            **kwargs
        )
        
        self.session.add(activity)
        self.session.commit()
    
    def get_daily_activity_count(self, account_id: int, 
                               activity_type: ActivityType) -> int:
        """Получение количества активности за день"""
        today = datetime.utcnow().date()
        tomorrow = today + timedelta(days=1)
        
        return self.session.query(Activity).filter(
            Activity.account_id == account_id,
            Activity.activity_type == activity_type,
            Activity.created_at >= today,
            Activity.created_at < tomorrow
        ).count()
    
    def can_perform_activity(self, account_id: int, 
                           activity_type: ActivityType) -> bool:
        """Проверка возможности выполнения активности"""
        account = self.get_account(account_id)
        if not account or account.status != AccountStatus.ACTIVE:
            return False
        
        daily_count = self.get_daily_activity_count(account_id, activity_type)
        
        if activity_type == ActivityType.LIKE:
            return daily_count < account.daily_likes_limit
        elif activity_type == ActivityType.FOLLOW:
            return daily_count < account.daily_follows_limit
        elif activity_type == ActivityType.COMMENT:
            return daily_count < account.daily_comments_limit
        
        return True
    
    def get_account_statistics(self, account_id: int) -> Dict[str, Any]:
        """Получение статистики аккаунта"""
        account = self.get_account(account_id)
        if not account:
            return {}
        
        today = datetime.utcnow().date()
        week_ago = today - timedelta(days=7)
        
        # Статистика за сегодня
        today_posts = self.session.query(Post).filter(
            Post.account_id == account_id,
            Post.published_time >= today
        ).count()
        
        today_likes = self.get_daily_activity_count(account_id, ActivityType.LIKE)
        today_follows = self.get_daily_activity_count(account_id, ActivityType.FOLLOW)
        
        # Статистика за неделю
        week_posts = self.session.query(Post).filter(
            Post.account_id == account_id,
            Post.published_time >= week_ago
        ).count()
        
        return {
            'account_info': {
                'username': account.username,
                'status': account.status.value,
                'followers': account.followers_count,
                'following': account.following_count,
                'posts': account.posts_count
            },
            'today': {
                'posts': today_posts,
                'likes': today_likes,
                'follows': today_follows
            },
            'week': {
                'posts': week_posts
            }
        }

# Пример использования
def main():
    db = DatabaseManager("postgresql://user:password@localhost/instagram_automation")
    
    # Создание аккаунта
    account = db.create_account(
        username="test_account",
        password="secure_password",
        email="test@example.com",
        full_name="Test Account"
    )
    
    # Создание контента
    content = db.create_content(
        title="Мой первый пост",
        image_path="/content/images/post1.jpg",
        description="Описание поста",
        hashtags=["instagram", "автопостинг", "бот"]
    )
    
    # Планирование поста
    scheduled_time = datetime.utcnow() + timedelta(hours=1)
    post = db.schedule_post(
        account_id=account.id,
        content_id=content.id,
        scheduled_time=scheduled_time,
        caption="Привет, мир!"
    )
    
    print(f"Пост запланирован с ID: {post.id}")

if __name__ == "__main__":
    main()
```

---

## 🔒 Система прокси и безопасность

### Управление прокси

#### **Класс для работы с прокси**
```python
import requests
import time
import random
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

@dataclass
class ProxyInfo:
    host: str
    port: int
    username: Optional[str] = None
    password: Optional[str] = None
    protocol: str = 'http'
    country: Optional[str] = None
    response_time: Optional[float] = None
    success_rate: float = 100.0
    last_check: Optional[float] = None
    is_working: bool = True

class ProxyManager:
    def __init__(self):
        self.proxies: List[ProxyInfo] = []
        self.proxy_pool: Dict[str, List[ProxyInfo]] = {}
        self.lock = threading.Lock()
        
    def add_proxy(self, proxy: ProxyInfo):
        """Добавление прокси в пул"""
        with self.lock:
            self.proxies.append(proxy)
            
            # Группировка по странам
            country = proxy.country or 'unknown'
            if country not in self.proxy_pool:
                self.proxy_pool[country] = []
            self.proxy_pool[country].append(proxy)
    
    def load_proxies_from_file(self, file_path: str):
        """Загрузка прокси из файла"""
        try:
            with open(file_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith('#'):
                        continue
                    
                    # Формат: protocol://username:password@host:port
                    # или host:port:username:password
                    proxy = self._parse_proxy_string(line)
                    if proxy:
                        self.add_proxy(proxy)
                        
        except FileNotFoundError:
            print(f"Файл прокси не найден: {file_path}")
    
    def _parse_proxy_string(self, proxy_str: str) -> Optional[ProxyInfo]:
        """Парсинг строки прокси"""
        try:
            if '://' in proxy_str:
                # Формат: protocol://username:password@host:port
                parts = proxy_str.split('://')
                protocol = parts[0]
                rest = parts[1]
                
                if '@' in rest:
                    auth, address = rest.split('@')
                    username, password = auth.split(':')
                else:
                    username, password = None, None
                    address = rest
                
                host, port = address.split(':')
                
            else:
                # Формат: host:port:username:password
                parts = proxy_str.split(':')
                if len(parts) >= 2:
                    host, port = parts[0], parts[1]
                    username = parts[2] if len(parts) > 2 else None
                    password = parts[3] if len(parts) > 3 else None
                    protocol = 'http'
                else:
                    return None
            
            return ProxyInfo(
                host=host,
                port=int(port),
                username=username,
                password=password,
                protocol=protocol
            )
            
        except Exception as e:
            print(f"Ошибка парсинга прокси {proxy_str}: {e}")
            return None
    
    def check_proxy(self, proxy: ProxyInfo, timeout: int = 10) -> bool:
        """Проверка работоспособности прокси"""
        try:
            proxy_dict = {
                'http': f'{proxy.protocol}://',
                'https': f'{proxy.protocol}://'
            }
            
            if proxy.username and proxy.password:
                proxy_dict['http'] += f'{proxy.username}:{proxy.password}@'
                proxy_dict['https'] += f'{proxy.username}:{proxy.password}@'
            
            proxy_dict['http'] += f'{proxy.host}:{proxy.port}'
            proxy_dict['https'] += f'{proxy.host}:{proxy.port}'
            
            start_time = time.time()
            
            response = requests.get(
                'http://httpbin.org/ip',
                proxies=proxy_dict,
                timeout=timeout
            )
            
            end_time = time.time()
            proxy.response_time = end_time - start_time
            proxy.last_check = time.time()
            
            if response.status_code == 200:
                proxy.is_working = True
                return True
            else:
                proxy.is_working = False
                return False
                
        except Exception as e:
            proxy.is_working = False
            proxy.last_check = time.time()
            return False
    
    def check_all_proxies(self, max_workers: int = 50):
        """Проверка всех прокси в пуле"""
        print(f"Проверяем {len(self.proxies)} прокси...")
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = {
                executor.submit(self.check_proxy, proxy): proxy 
                for proxy in self.proxies
            }
            
            working_count = 0
            for future in as_completed(futures):
                proxy = futures[future]
                try:
                    is_working = future.result()
                    if is_working:
                        working_count += 1
                        print(f"✅ {proxy.host}:{proxy.port} - OK ({proxy.response_time:.2f}s)")
                    else:
                        print(f"❌ {proxy.host}:{proxy.port} - FAILED")
                except Exception as e:
                    print(f"❌ {proxy.host}:{proxy.port} - ERROR: {e}")
        
        print(f"Работающих прокси: {working_count}/{len(self.proxies)}")
    
    def get_working_proxies(self) -> List[ProxyInfo]:
        """Получение списка работающих прокси"""
        return [proxy for proxy in self.proxies if proxy.is_working]
    
    def get_random_proxy(self, country: str = None) -> Optional[ProxyInfo]:
        """Получение случайного прокси"""
        if country and country in self.proxy_pool:
            available_proxies = [p for p in self.proxy_pool[country] if p.is_working]
        else:
            available_proxies = self.get_working_proxies()
        
        if not available_proxies:
            return None
        
        return random.choice(available_proxies)
    
    def get_proxy_for_emulator(self, emulator_id: str) -> Optional[ProxyInfo]:
        """Получение прокси для конкретного эмулятора"""
        # Здесь можно реализовать логику привязки прокси к эмуляторам
        # Например, использовать хеш от ID эмулятора
        
        working_proxies = self.get_working_proxies()
        if not working_proxies:
            return None
        
        # Детерминированный выбор на основе ID эмулятора
        proxy_index = hash(emulator_id) % len(working_proxies)
        return working_proxies[proxy_index]

# Пример использования
proxy_manager = ProxyManager()
proxy_manager.load_proxies_from_file('proxies.txt')
proxy_manager.check_all_proxies()

# Получение прокси для эмулятора
proxy = proxy_manager.get_proxy_for_emulator('emulator_001')
if proxy:
    print(f"Прокси для эмулятора: {proxy.host}:{proxy.port}")
```

### Система безопасности и антидетект

```python
import random
import time
import hashlib
import uuid
from typing import Dict, List, Any
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class DeviceFingerprint:
    """Отпечаток устройства для антидетекта"""
    device_model: str
    android_version: str
    build_number: str
    manufacturer: str
    brand: str
    imei: str
    android_id: str
    serial_number: str
    mac_address: str
    resolution: str
    dpi: int
    user_agent: str

class AntiDetectionSystem:
    def __init__(self):
        self.device_models = [
            'SM-G973F', 'SM-G975F', 'SM-N975F', 'SM-A505F', 'SM-A705F',
            'Pixel 4', 'Pixel 4 XL', 'Pixel 3a', 'Pixel 3a XL',
            'OnePlus 7T', 'OnePlus 8', 'OnePlus 8 Pro',
            'LG-H870', 'LG-H930', 'LG-V350',
            'HUAWEI P30', 'HUAWEI P30 Pro', 'HUAWEI Mate 20'
        ]
        
        self.android_versions = [
            '9', '10', '11', '12'
        ]
        
        self.resolutions = [
            '720x1280', '1080x1920', '1440x2560', '1080x2340'
        ]
        
        self.user_agents = [
            'Instagram 239.0.0.13.109 Android (29/10; 420dpi; 1080x2340; samsung; SM-G973F; beyond1; exynos9820; en_US; 369468651)',
            'Instagram 238.0.0.17.109 Android (28/9; 480dpi; 1080x1920; OnePlus; ONEPLUS A6000; OnePlus6; qcom; en_US; 369468651)',
            'Instagram 237.0.0.16.109 Android (30/11; 440dpi; 1080x2400; Google; Pixel 4; flame; flame; en_US; 369468651)'
        ]
    
    def generate_device_fingerprint(self, seed: str = None) -> DeviceFingerprint:
        """Генерация отпечатка устройства"""
        if seed:
            random.seed(seed)
        
        device_model = random.choice(self.device_models)
        android_version = random.choice(self.android_versions)
        resolution = random.choice(self.resolutions)
        
        # Определение производителя по модели
        if device_model.startswith('SM-'):
            manufacturer = 'samsung'
            brand = 'Samsung'
        elif device_model.startswith('Pixel'):
            manufacturer = 'Google'
            brand = 'Google'
        elif device_model.startswith('OnePlus'):
            manufacturer = 'OnePlus'
            brand = 'OnePlus'
        elif device_model.startswith('LG-'):
            manufacturer = 'LGE'
            brand = 'LG'
        elif device_model.startswith('HUAWEI'):
            manufacturer = 'HUAWEI'
            brand = 'HUAWEI'
        else:
            manufacturer = 'unknown'
            brand = 'Unknown'
        
        return DeviceFingerprint(
            device_model=device_model,
            android_version=android_version,
            build_number=self._generate_build_number(),
            manufacturer=manufacturer,
            brand=brand,
            imei=self._generate_imei(),
            android_id=self._generate_android_id(),
            serial_number=self._generate_serial(),
            mac_address=self._generate_mac_address(),
            resolution=resolution,
            dpi=self._calculate_dpi(resolution),
            user_agent=random.choice(self.user_agents)
        )
    
    def _generate_imei(self) -> str:
        """Генерация IMEI"""
        # Простая генерация IMEI (в реальности нужно более сложная логика)
        imei = ''.join([str(random.randint(0, 9)) for _ in range(15)])
        return imei
    
    def _generate_android_id(self) -> str:
        """Генерация Android ID"""
        return hashlib.md5(str(uuid.uuid4()).encode()).hexdigest()[:16]
    
    def _generate_serial(self) -> str:
        """Генерация серийного номера"""
        return ''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=10))
    
    def _generate_mac_address(self) -> str:
        """Генерация MAC адреса"""
        mac = [random.randint(0x00, 0xff) for _ in range(6)]
        return ':'.join(f'{x:02x}' for x in mac)
    
    def _generate_build_number(self) -> str:
        """Генерация номера сборки"""
        return f"{''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZ', k=3))}{random.randint(10, 99)}"
    
    def _calculate_dpi(self, resolution: str) -> int:
        """Расчет DPI на основе разрешения"""
        width, height = map(int, resolution.split('x'))
        if width >= 1440:
            return random.choice([560, 640])
        elif width >= 1080:
            return random.choice([420, 480])
        else:
            return random.choice([320, 360])

class BehaviorSimulator:
    """Симулятор человеческого поведения"""
    
    def __init__(self):
        self.typing_patterns = {
            'fast': (0.05, 0.15),
            'normal': (0.1, 0.3),
            'slow': (0.2, 0.5)
        }
        
        self.scroll_patterns = {
            'quick': (0.5, 1.0),
            'normal': (1.0, 2.0),
            'slow': (2.0, 4.0)
        }
    
    def get_typing_delay(self, pattern: str = 'normal') -> float:
        """Получение задержки при печати"""
        min_delay, max_delay = self.typing_patterns.get(pattern, self.typing_patterns['normal'])
        return random.uniform(min_delay, max_delay)
    
    def get_scroll_delay(self, pattern: str = 'normal') -> float:
        """Получение задержки при скролле"""
        min_delay, max_delay = self.scroll_patterns.get(pattern, self.scroll_patterns['normal'])
        return random.uniform(min_delay, max_delay)
    
    def get_action_delay(self, base_delay: float = 2.0, variance: float = 1.0) -> float:
        """Получение задержки между действиями"""
        return random.uniform(base_delay - variance, base_delay + variance)
    
    def should_take_break(self, actions_count: int, break_probability: float = 0.1) -> bool:
        """Определение необходимости перерыва"""
        if actions_count > 0 and actions_count % 10 == 0:
            return random.random() < break_probability
        return False
    
    def get_break_duration(self) -> float:
        """Получение длительности перерыва"""
        return random.uniform(30, 300)  # от 30 секунд до 5 минут

class ActivityLimiter:
    """Ограничитель активности для предотвращения блокировок"""
    
    def __init__(self):
        self.limits = {
            'likes_per_hour': 30,
            'follows_per_hour': 20,
            'comments_per_hour': 10,
            'posts_per_day': 3,
            'stories_per_day': 5
        }
        
        self.activity_log: Dict[str, List[datetime]] = {}
    
    def can_perform_action(self, account_id: str, action_type: str) -> bool:
        """Проверка возможности выполнения действия"""
        key = f"{account_id}_{action_type}"
        now = datetime.utcnow()
        
        if key not in self.activity_log:
            self.activity_log[key] = []
        
        # Очистка старых записей
        if action_type.endswith('_per_hour'):
            cutoff_time = now - timedelta(hours=1)
            limit_key = action_type
        else:  # per_day
            cutoff_time = now - timedelta(days=1)
            limit_key = action_type
        
        self.activity_log[key] = [
            timestamp for timestamp in self.activity_log[key]
            if timestamp > cutoff_time
        ]
        
        # Проверка лимита
        current_count = len(self.activity_log[key])
        limit = self.limits.get(limit_key, 0)
        
        return current_count < limit
    
    def log_action(self, account_id: str, action_type: str):
        """Логирование выполненного действия"""
        key = f"{account_id}_{action_type}"
        if key not in self.activity_log:
            self.activity_log[key] = []
        
        self.activity_log[key].append(datetime.utcnow())
    
    def get_next_available_time(self, account_id: str, action_type: str) -> datetime:
        """Получение времени, когда действие снова станет доступным"""
        key = f"{account_id}_{action_type}"
        
        if key not in self.activity_log or not self.activity_log[key]:
            return datetime.utcnow()
        
        if action_type.endswith('_per_hour'):
            oldest_action = min(self.activity_log[key])
            return oldest_action + timedelta(hours=1)
        else:  # per_day
            oldest_action = min(self.activity_log[key])
            return oldest_action + timedelta(days=1)

# Интеграция с основным ботом
class SecureInstagramBot(InstagramBot):
    def __init__(self, emulator_name: str, appium_port: int = 4723):
        super().__init__(emulator_name, appium_port)
        
        self.anti_detection = AntiDetectionSystem()
        self.behavior_sim = BehaviorSimulator()
        self.activity_limiter = ActivityLimiter()
        
        # Генерация уникального отпечатка для этого бота
        self.device_fingerprint = self.anti_detection.generate_device_fingerprint(emulator_name)
        
        self.actions_count = 0
    
    def secure_action(self, action_func, action_type: str, *args, **kwargs):
        """Безопасное выполнение действия с проверками"""
        account_id = kwargs.get('account_id', self.emulator_name)
        
        # Проверка лимитов
        if not self.activity_limiter.can_perform_action(account_id, action_type):
            next_time = self.activity_limiter.get_next_available_time(account_id, action_type)
            self.logger.warning(f"Лимит {action_type} достигнут. Следующее действие: {next_time}")
            return False
        
        # Проверка необходимости перерыва
        if self.behavior_sim.should_take_break(self.actions_count):
            break_duration = self.behavior_sim.get_break_duration()
            self.logger.info(f"Делаем перерыв на {break_duration:.1f} секунд")
            time.sleep(break_duration)
        
        # Задержка перед действием
        delay = self.behavior_sim.get_action_delay()
        time.sleep(delay)
        
        # Выполнение действия
        try:
            result = action_func(*args, **kwargs)
            
            if result:
                self.activity_limiter.log_action(account_id, action_type)
                self.actions_count += 1
            
            return result
            
        except Exception as e:
            self.logger.error(f"Ошибка выполнения {action_type}: {e}")
            return False
    
    def secure_create_post(self, image_path: str, caption: str, hashtags: List[str] = None) -> bool:
        """Безопасное создание поста"""
        return self.secure_action(
            super().create_post,
            'posts_per_day',
            image_path=image_path,
            caption=caption,
            hashtags=hashtags
        )
    
    def secure_like_posts(self, hashtag: str, count: int = 10) -> int:
        """Безопасный лайк постов"""
        liked_count = 0
        
        for i in range(count):
            if self.secure_action(self._like_single_post, 'likes_per_hour'):
                liked_count += 1
            else:
                break
        
        return liked_count
    
    def _like_single_post(self) -> bool:
        """Лайк одного поста (вспомогательный метод)"""
        # Здесь должна быть логика лайка одного поста
        return True

# Пример использования
def main():
    bot = SecureInstagramBot("Instagram_Bot_001")
    
    if bot.connect_to_emulator():
        # Безопасное создание поста
        success = bot.secure_create_post(
            image_path="/content/images/post1.jpg",
            caption="Мой безопасный пост!",
            hashtags=["безопасность", "автопостинг"]
        )
        
        if success:
            print("✅ Пост создан безопасно")
        else:
            print("❌ Не удалось создать пост (возможно, достигнут лимит)")
        
        bot.disconnect()

if __name__ == "__main__":
    main()
```