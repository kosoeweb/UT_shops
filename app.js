async function submitShop() {
    const name = document.getElementById('shopName').value;
    const size = document.getElementById('shopSize').value;
    const type = document.getElementById('shopType').value;
    const conn = document.getElementById('shopConn').value;
    const file = document.getElementById('shopPhoto').files[0];

    if (!name || !file) {
        return Swal.fire('Error', 'Name and Photo are required!', 'error');
    }

    Swal.fire({ title: 'Registering...', didOpen: () => Swal.showLoading() });

    try {
        // ၁။ Get Geolocation
        const pos = await new Promise((res, rej) => {
            navigator.geolocation.getCurrentPosition(res, rej);
        });

        // ၂။ Upload Image to Supabase Storage
        const fileName = Date.now() + "_" + file.name;
        const { data: uploadData, error: uploadErr } = await supabase.storage
            .from('shop_images')
            .upload(fileName, file);
        
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from('shop_images').getPublicUrl(fileName);

        // ၃။ Save to Database
        const { error: dbErr } = await supabase.from('shops_location').insert([{
            name, size, type, connection: conn,
            photo_url: urlData.publicUrl,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
        }]);

        if (dbErr) throw dbErr;

        Swal.fire('Success', 'Shop registered successfully!', 'success').then(() => location.reload());

    } catch (err) {
        Swal.fire('Error', err.message, 'error');
    }
}