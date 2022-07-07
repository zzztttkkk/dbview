package dbs

type TLSConfig struct {
	Cert       string `json:"cert"`
	Key        string `json:"key"`
	ServerName string `json:"server_name"`
}
