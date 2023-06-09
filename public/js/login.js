const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

const showAlert = (type, msg) => {
  hideAlert();
  const markup = `<div class='alert alert--${type}'>${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
};
const login=async (email,password)=>{
    console.log('A');
    try{
        const res=await axios({
            method:'post',
            url:'/api/v1/users/login',
            data:{
                email,password
            }
        })
        if(res.data.status==='Success'){
            console.log("hhhhhhhhhhhh");
            showAlert('success',"LogedIn SucessFully");
            window.setTimeout(()=>{
                location.assign('/')
            },1500)
        }
    }catch(err){
        showAlert('error',res.data.message)
    }
}


document.querySelector('.form').addEventListener('submit', e =>{
    e.preventDefault();
    const email=document.getElementById('email').value;
    const password=document.getElementById('password').value;
    login(email,password)
})


