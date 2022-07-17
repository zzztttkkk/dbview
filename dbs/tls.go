package dbs

type TLSConfig struct {
	Cert       string `json:"cert"`
	Key        string `json:"key"`
	ServerName string `json:"servername"`
}

type TLSPEMConfig struct {
	Pem        string `json:"pem"`
	ServerName string `json:"servername"`
}
