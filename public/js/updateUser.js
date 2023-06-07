
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
const updateData=async (data,url)=>{
    try{
        const upd=await axios({
            method:'patch',
            url,
            data
        })
        if(upd.data.status==="Success"){
            showAlert('success',"Sucessfully Updated Data");
            window.setTimeout(()=>{
                location.assign('/me')
            },1500)
        }
    }catch(err){
        console.log(err.response);
        showAlert('error',err.response.data.message)
    }
}


document.querySelector('.form').addEventListener('submit', e =>{
    e.preventDefault();
    const form =new FormData();
    form.append('name',document.getElementById('name').value);
    form.append('email',document.getElementById('email').value);
    form.append('photo',document.getElementById('photo').files[0]);
    console.log(form);

    let url='/api/v1/users/updateMe';
    updateData(form,url);
});
document.getElementById('pass').addEventListener('submit', e =>{
    e.preventDefault();
    const currentPassWord=document.getElementById('password-current').value;
    const newPassword=document.getElementById('password').value;
    const passwordConfirm=document.getElementById('password-confirm').value;
    const data={
        currentPassWord,newPassword,passwordConfirm
    }
    let url='/api/v1/users/updatePassword';
    updateData(data,url)
})


