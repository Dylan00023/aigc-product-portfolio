with open('d:/前端项目/6/aigc-product-portfolio/src/views/auth/LoginPage.vue','r',encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    '  authStore.accessToken = mockToken\n  authStore.refreshToken = mockRefreshToken\n  authStore.deviceId = mockDeviceId',
    '  authStore.accessToken.value = mockToken\n  authStore.refreshToken.value = mockRefreshToken\n  authStore.deviceId.value = mockDeviceId'
)
c = c.replace(
    'const handleDevLogin = () => {',
    'const handleDevLogin = async () => {'
)
c = c.replace(
    "  router.push(redirect || '/')",
    "  await router.push(redirect || '/')"
)

with open('d:/前端项目/6/aigc-product-portfolio/src/views/auth/LoginPage.vue','w',encoding='utf-8') as f:
    f.write(c)
print('done')
