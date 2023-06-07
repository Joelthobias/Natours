

const logout=async ()=>{
    try{
        const res=await axios({
            method:'post',
            url:'/api/v1/users/logout',
            
        })
        console.log(res);
        if(res.data.status==='Success'){
            console.log("logout");
            location.assign('/login');
        }
    }catch(error){
        showAlert('error','Error logging out !, Try Again . ')
    }
    
};
const lOut=document.getElementById('logout');
if(lOut){
    lOut.addEventListener('click',e=>{
        e.preventDefault();
        logout();
    })
    
}