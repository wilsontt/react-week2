import { useState, useEffect } from 'react'
import axios from 'axios';

// 引入 CSS
import "./assets/style.css";

// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

// 日曆圖示
const CalendarIcon = () => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = date.getDate();

  // yyyy-MM-dd
  const dateString =
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0");

  // HH:MM:SS
  const timeString =
    String(date.getHours()).padStart(2, "0") +
    ":" +
    String(date.getMinutes()).padStart(2, "0") +
    ":" +
    String(date.getSeconds()).padStart(2, "0");

  return (
    <div className="flex items-center gap-2 pr-1">
      <div className="flex flex-col items-center w-10 h-11 border-2 border-gray-800 rounded-xl overflow-hidden bg-white shadow-sm scale-90 shrink-0">
        <div className="bg-red-500 w-full text-[9px] font-black text-center text-white py-0.5 border-b-2 border-gray-800">
          {month}
        </div>
        <div className="bg-white w-full grow flex items-center justify-center text-sm font-black text-gray-800 leading-none">
          {day}
        </div>
      </div>
      <div className="flex flex-col justify-center leading-none">
        <div className="text-sm font-black text-blue-400 tracking-tight mb-0.5">
          {dateString}
        </div>
        <div className="text-sm font-black text-gray-800 font-mono">
          {timeString}
        </div>
      </div>
    </div>
  );
};

function App() {
  // 儲存登入表單資料，使用 useState 管理表單資料
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  // 使用useState狀態管理
  // 登入狀態管理
  const [isAuth, setIsAuth] = useState(false);

  // 處理表單輸入
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((preData) => ({
      ...preData, // 保留之前的資料
      [name]: value, // 更新指定的欄位
    }));
  };

  // 處理登入作業 表單提交
  const onSubmit = async (e) => {
    e.preventDefault(); // 防止表單預設行為
    try {
      // 登入請求，並取得 token。
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = response.data;
      // console.log('登入成功', response.data);
      // 儲存 token 到 Cookie。
      document.cookie = `hexToken=${token}; expires=${new Date(expired)};`;

      // 設定 axios 的 default headers
      axios.defaults.headers.common.Authorization = `${token}`;

      // 登入成功後，取得產品資料。
      getProducts();
      // 設定登入成功
      setIsAuth(true);
    } catch (error) {
      setIsAuth(false);
      // 使用 alert 顯示錯誤訊息
      window.alert("您輸入的帳號或密碼錯誤，請重新輸入。");
      console.error("登入失敗", error.response);
    }
  };

  // 登入驗證
  const checkLogin = async () => {
    try {
      // 取得 cookie 中的 token
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("hexToken="))
        .split("=")[1];
      // 設定 axios 的 default headers
      axios.defaults.headers.common["Authorization"] = token;
      // 登入驗證請求，並取得驗證結果。
      const response = await axios.post(`${API_BASE}/api/user/check`);
      window.alert("登入驗證成功: " + response.data.uid);
      console.log("登入驗證成功，Token： ", response.data);
    } catch (error) {
      console.error(
        "Login verification failed 登入驗證失敗: ",
        error.response.message
      );
    }
  };

  // 登入成功，開始取得產品資料狀態
  const [products, setProducts] = useState([]);
  // 取得選取到的產品明細
  const [tempProduct, setTempProduct] = useState();
  // 開始取得產品資料, 取得完成後，要靅 處理登入作業 進行表單內容的提交
  const getProducts = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products`
      );
      console.log("成功取得產品資料：", response.data);
      // 取得完成後，要到 「處理登入作業的表單內容提交」，進行表單內容的提交。
      setProducts(response.data.products);
    } catch (error) {
      console.error("取得產品資料失敗：", error.response.data.message);
    }
  };

  return (
    <>
      {!isAuth ? (
        // 登入表單
        <div className="container login">
          <div className="row">
            <div className="col-md-6">
              <h2 className="mb-3 font-weight-normal">Please Login 請先登入</h2>
            </div>
            {/* 日曆圖示 */}
            <div className="col-md-6 mb-3">
              <CalendarIcon />
            </div>
          </div>
          <form className="form-floating" onSubmit={(e) => onSubmit(e)}>
            <div className="form-floating">
              <input
                type="email"
                className="form-control w-100 mb-3 text-left"
                name="username"
                placeholder="name@example.com"
                value={formData.username}
                onChange={(e) => handleInputChange(e)}
              />
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input
                type="password"
                className="form-control w-100 mb-3 text-left"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange(e)}
              />
              <label htmlFor="password">Password</label>
            </div>
            <button className="w-100 mt-3 btn btn-lg btn-primary" type="submit">
              Login 登入
            </button>
          </form>
        </div>
      ) : (
        // 確認登入成功 顯示產品列表
        <div className="container mt-3">
          {/* <h2 className="mb-3 font-weight-normal">Login success 登入成功</h2> */}
          <div className="row w-100 container-fluid">
            <div className="col-md-6 mb-3">
              {/* 登入驗證按鈕 */}
              <button
                type="button"
                className="btn btn-lg btn-primary"
                onClick={checkLogin}
              >
                Check Login 確認登入
              </button>
            </div>
            {/* 日曆圖示 */}
            <div className="col-md-6 mb-3">
              <CalendarIcon />
            </div>
          </div>
          {/* 產品列表 */}
          <div className="row container-fluid">
            <div className="col-md-6">
              <h2>產品列表</h2>
              <table className="table">
                <thead>
                  <tr className="table-info">
                    <th>產品名稱</th>
                    <th>原價</th>
                    <th>售價</th>
                    <th>是否啟用</th>
                    <th>查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item) => (
                    <tr key={item.id}>
                      <td className="text-left">{item.title}</td>
                      <td className="text-right">{item.origin_price}</td>
                      <td className="text-right">{item.price}</td>
                      <td className="text-center">
                        {item.is_enabled ? "啟用" : "未啟用"}
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setTempProduct(item)}
                        >
                          查看細節
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="col-md-6 mt-1">
              <h2>單一產品細節</h2>
              {tempProduct ? (
                <div className="card mb-3 shadow-lg">
                  <img
                    src={tempProduct.imageUrl}
                    className="card-img-top primary-image"
                    alt="主圖"
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {tempProduct.title}
                      <span className="badge bg-primary ms-2">
                        {tempProduct.category}
                      </span>
                    </h5>
                    <p className="card-text">
                      商品描述：{tempProduct.description}
                    </p>
                    <p className="card-text">商品內容：{tempProduct.content}</p>
                    <div className="d-flex">
                      <p className="card-text text-secondary">
                        <del>{tempProduct.origin_price}</del>
                      </p>
                      元 / {tempProduct.price} 元
                    </div>
                    <h5 className="mt-3">更多圖片：</h5>
                    <div className="d-flex flex-wrap">
                      {tempProduct.imagesUrl?.map((url, index) => (
                        <img key={index} src={url} className="images" />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-secondary">請選擇一個商品查看</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
