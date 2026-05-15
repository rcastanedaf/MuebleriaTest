const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const PACKAGE = "com.anonymous.MuebleriaMovil";
const PACKAGE_PATH = PACKAGE.replace(/\./g, "/");

const DEV_FACTORY_KT = `package ${PACKAGE}

import android.annotation.SuppressLint
import com.facebook.react.modules.network.OkHttpClientFactory
import com.facebook.react.modules.network.OkHttpClientProvider
import okhttp3.OkHttpClient
import java.security.cert.X509Certificate
import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManager
import javax.net.ssl.X509TrustManager

@SuppressLint("CustomX509TrustManager", "TrustAllX509TrustManager")
class DevOkHttpClientFactory : OkHttpClientFactory {
    override fun createNewNetworkModuleClient(): OkHttpClient {
        val trustAll = arrayOf<TrustManager>(
            object : X509TrustManager {
                override fun checkClientTrusted(chain: Array<X509Certificate>, authType: String) {}
                override fun checkServerTrusted(chain: Array<X509Certificate>, authType: String) {}
                override fun getAcceptedIssuers(): Array<X509Certificate> = arrayOf()
            }
        )
        val sslCtx = SSLContext.getInstance("TLS")
        sslCtx.init(null, trustAll, java.security.SecureRandom())
        return OkHttpClientProvider.createClientBuilder()
            .sslSocketFactory(sslCtx.socketFactory, trustAll[0] as X509TrustManager)
            .hostnameVerifier { _, _ -> true }
            .build()
    }
}
`;

function withBackendCert(config) {
  return withDangerousMod(config, [
    "android",
    (config) => {
      const root = config.modRequest.platformProjectRoot;

      // 1. Copiar backend-cert.crt a raw resources
      const certSrc = path.join(config.modRequest.projectRoot, "backend-cert.crt");
      const rawDir = path.join(root, "app/src/main/res/raw");
      if (fs.existsSync(certSrc)) {
        fs.mkdirSync(rawDir, { recursive: true });
        fs.copyFileSync(certSrc, path.join(rawDir, "backend_cert.crt"));
      }

      // 2. Crear DevOkHttpClientFactory.kt
      const srcDir = path.join(root, "app/src/main/java", PACKAGE_PATH);
      fs.mkdirSync(srcDir, { recursive: true });
      fs.writeFileSync(path.join(srcDir, "DevOkHttpClientFactory.kt"), DEV_FACTORY_KT);

      // 3. Inyectar en MainApplication.kt
      const mainAppPath = path.join(srcDir, "MainApplication.kt");
      if (fs.existsSync(mainAppPath)) {
        let src = fs.readFileSync(mainAppPath, "utf8");

        if (!src.includes("OkHttpClientProvider")) {
          src = src.replace(
            "import com.facebook.react.PackageList",
            "import com.facebook.react.PackageList\nimport com.facebook.react.modules.network.OkHttpClientProvider"
          );
        }

        if (!src.includes("DevOkHttpClientFactory")) {
          src = src.replace(
            "super.onCreate()",
            "super.onCreate()\n    if (BuildConfig.DEBUG) { OkHttpClientProvider.setOkHttpClientFactory(DevOkHttpClientFactory()) }"
          );
        }

        fs.writeFileSync(mainAppPath, src);
      }

      return config;
    },
  ]);
}

module.exports = withBackendCert;
