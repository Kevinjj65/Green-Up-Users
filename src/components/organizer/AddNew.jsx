import Footer from './Footer'
import './Organizer.css'

function AddNew() {
    return(
        <>
            <main>
                <h1>Organize Now</h1>
                <input className='input name' type='text' placeholder='Name of the Event' />
                <input className='input date' type='text' placeholder='Date' />
                <input className='input time' type='text' placeholder='Time' />
                <input className='input loc' type='text' placeholder='Location' />
                <input className='input nop' type='text' placeholder='Max No. of Participants' />
                <input className='input rewpts' type='text' placeholder='Alloted Reward Points' />
                <div className='check'>
                    <input className='checkbox' type='checkbox' /><span className='check-text'>I agree to Terms & Conditions</span>
                </div>
                <button className='btn1 regbtn'>Register Now</button>
            </main>
            <Footer />
        </>
    )
}

export default AddNew