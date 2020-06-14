$(function () {
    $('.plugin-switch').change(async function() {
        await fetch(`/servers/${window.location.pathname.split('/')[2]}/switch/${$(this).data('switch')}/${this.checked}`)
        this.checked = (await ((await fetch(`/servers/${window.location.pathname.split('/')[2]}/status/${$(this).data('switch')}`)).json())).active
    })
})